from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from user_models import *
from user_database import user_db
from auth import get_current_user
from ai_analyzer import ai_analyzer
from typing import List, AsyncGenerator
import asyncio
import json
import uuid

router = APIRouter(prefix="/api/chat", tags=["chat_with_athena"])

async def get_user_context(user_id: str) -> str:
    """Build context about user for Athena conversations."""
    try:
        user = user_db.get_user_by_id(user_id)
        profile = user_db.get_user_profile(user_id)
        careers = user_db.get_user_careers(user_id)
        certifications = user_db.get_user_certifications(user_id)
        skills = user_db.get_user_skills(user_id)
        roadmap = user_db.get_user_roadmap(user_id)
        
        context = f"""User Profile Context for Athena:
        
Name: {user.first_name} {user.last_name}
Email: {user.email}

Current Role: {profile.current_role if profile and profile.current_role else 'Not specified'}
Years of Experience: {profile.years_of_experience if profile and profile.years_of_experience else 'Not specified'}
Location: {profile.location if profile and profile.location else 'Not specified'}
Career Goals: {profile.career_goals if profile and profile.career_goals else 'Not specified'}

Career History:
"""
        
        if careers:
            for career in careers[:3]:  # Last 3 careers
                context += f"- {career.job_title} at {career.company_name}"
                if career.industry:
                    context += f" ({career.industry})"
                context += f" from {career.start_date.strftime('%Y-%m')} to {'Present' if career.is_current else career.end_date.strftime('%Y-%m') if career.end_date else 'Unknown'}\n"
        else:
            context += "- No career history recorded\n"
        
        context += "\nSkills:\n"
        if skills:
            for skill in skills[:10]:  # Top 10 skills
                context += f"- {skill.skill_name} ({skill.level})\n"
        else:
            context += "- No skills recorded\n"
        
        context += "\nCertifications:\n"
        if certifications:
            for cert in certifications[:5]:  # Top 5 certifications
                context += f"- {cert.name} from {cert.issuing_organization}\n"
        else:
            context += "- No certifications recorded\n"
        
        context += "\nCurrent Roadmap Progress:\n"
        if roadmap:
            in_progress = [item for item in roadmap if item.status == RoadmapStatus.IN_PROGRESS]
            completed = [item for item in roadmap if item.status == RoadmapStatus.COMPLETED]
            
            context += f"- Total roadmap items: {len(roadmap)}\n"
            context += f"- Completed: {len(completed)}\n"
            context += f"- In progress: {len(in_progress)}\n"
            
            if in_progress:
                context += "Current focus areas:\n"
                for item in in_progress[:3]:
                    context += f"  • {item.title}\n"
        else:
            context += "- No roadmap items yet\n"
        
        return context
        
    except Exception as e:
        return f"Error getting user context: {str(e)}"

class AthenaChat:
    def __init__(self):
        self.ai_analyzer = ai_analyzer
    
    async def create_athena_session(self, user_id: str, conversation_id: str, streaming: bool = False):
        """Create a chat session with user context for Athena."""
        user_context = await get_user_context(user_id)
        
        system_message = f"""You are Athena, the AI career advisor for CareerPilot. You are wise, supportive, and knowledgeable about career development, job markets, and professional growth.

Your personality:
- Wise and insightful (named after the Greek goddess of wisdom)
- Supportive and encouraging
- Professional but approachable
- Focused on actionable career advice
- Remember and reference the user's background in your responses

Your capabilities:
- Career guidance and planning
- Skill development recommendations
- Industry insights and trends
- Interview preparation advice
- Resume and portfolio guidance
- Networking strategies
- Work-life balance advice
- Professional development planning

User Context:
{user_context}

Guidelines:
- Always address the user by their first name when appropriate
- Reference their background, skills, and goals in your advice
- Provide specific, actionable recommendations
- Ask clarifying questions when needed
- Be encouraging and supportive of their career journey
- Keep responses conversational but professional
- If asked about topics outside career guidance, politely redirect to career-related topics

Remember: You are Athena, their dedicated AI career advisor at CareerPilot. You have access to their profile and can reference their specific situation in your guidance."""

        chat = self.ai_analyzer._create_chat_session(conversation_id)
        chat.system_message = system_message
        
        # Configure streaming if requested
        if streaming:
            chat = chat.with_params(stream=True)
        
        return chat

athena_chat = AthenaChat()

@router.get("/conversations", response_model=List[ChatConversation])
async def get_user_conversations(current_user_id: str = Depends(get_current_user)):
    """Get user's chat conversations with Athena."""
    try:
        return user_db.get_user_conversations(current_user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversations: {str(e)}"
        )

@router.post("/conversations")
async def create_conversation(
    title: str = "Chat with Athena",
    current_user_id: str = Depends(get_current_user)
):
    """Create a new conversation with Athena."""
    try:
        conversation_id = user_db.create_conversation(current_user_id, title)
        
        # Add welcome message from Athena
        user = user_db.get_user_by_id(current_user_id)
        welcome_message = ChatMessage(
            user_id=current_user_id,
            conversation_id=conversation_id,
            message_type=ChatMessageType.ATHENA,
            content=f"Hello {user.first_name}! I'm Athena, your AI career advisor at CareerPilot. I'm here to help you navigate your career journey. What would you like to discuss today?",
            metadata={"message_type": "welcome"}
        )
        
        user_db.add_chat_message(welcome_message)
        
        return {
            "message": "Conversation created successfully",
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )

@router.get("/conversations/{conversation_id}/messages", response_model=List[ChatMessage])
async def get_conversation_messages(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Get messages from a conversation."""
    try:
        # Verify conversation belongs to user
        conversation = user_db.conversations.find_one({
            "id": conversation_id,
            "user_id": current_user_id
        })
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return user_db.get_conversation_messages(conversation_id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}"
        )

@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    message_data: ChatMessageCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Send a message to Athena."""
    try:
        # Verify conversation belongs to user
        conversation = user_db.conversations.find_one({
            "id": conversation_id,
            "user_id": current_user_id
        })
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Add user message
        user_message = ChatMessage(
            user_id=current_user_id,
            conversation_id=conversation_id,
            message_type=ChatMessageType.USER,
            content=message_data.content
        )
        
        user_db.add_chat_message(user_message)
        
        # Get Athena's response
        try:
            chat = await athena_chat.create_athena_session(current_user_id, conversation_id)
            
            from emergentintegrations.llm.chat import UserMessage
            user_msg = UserMessage(text=message_data.content)
            athena_response = await chat.send_message(user_msg)
            
            # Add Athena's response
            athena_message = ChatMessage(
                user_id=current_user_id,
                conversation_id=conversation_id,
                message_type=ChatMessageType.ATHENA,
                content=athena_response,
                metadata={"model": "gpt-4o", "timestamp": datetime.now().isoformat()}
            )
            
            user_db.add_chat_message(athena_message)
            
            return {
                "message": "Message sent successfully",
                "user_message_id": user_message.id,
                "athena_message_id": athena_message.id,
                "athena_response": athena_response
            }
            
        except Exception as ai_error:
            # If AI fails, add a fallback message
            fallback_message = ChatMessage(
                user_id=current_user_id,
                conversation_id=conversation_id,
                message_type=ChatMessageType.ATHENA,
                content="I apologize, but I'm having trouble processing your message right now. Please try again in a moment. In the meantime, feel free to explore your career profile and roadmap!",
                metadata={"error": str(ai_error), "fallback": True}
            )
            
            user_db.add_chat_message(fallback_message)
            
            return {
                "message": "Message sent, but AI response failed",
                "user_message_id": user_message.id,
                "athena_message_id": fallback_message.id,
                "athena_response": fallback_message.content,
                "error": "AI temporarily unavailable"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete a conversation."""
    try:
        # Verify conversation belongs to user
        conversation = user_db.conversations.find_one({
            "id": conversation_id,
            "user_id": current_user_id
        })
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Mark conversation as inactive instead of deleting
        user_db.conversations.update_one(
            {"id": conversation_id},
            {"$set": {"is_active": False}}
        )
        
        return {"message": "Conversation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )

@router.post("/quick-question")
async def ask_quick_question(
    message_data: ChatMessageCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Ask a quick question to Athena without creating a full conversation."""
    try:
        # Create a temporary conversation ID
        temp_conversation_id = f"quick_{current_user_id}_{datetime.now().timestamp()}"
        
        # Get Athena's response
        try:
            chat = await athena_chat.create_athena_session(current_user_id, temp_conversation_id)
            
            from emergentintegrations.llm.chat import UserMessage
            user_msg = UserMessage(text=message_data.content)
            athena_response = await chat.send_message(user_msg)
            
            return {
                "question": message_data.content,
                "athena_response": athena_response,
                "suggestion": "Would you like to start a full conversation with me to dive deeper into this topic?"
            }
            
        except Exception as ai_error:
            return {
                "question": message_data.content,
                "athena_response": "I'm sorry, I'm having trouble processing your question right now. Please try again or start a full conversation with me!",
                "error": "AI temporarily unavailable"
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process quick question: {str(e)}"
        )