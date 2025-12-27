from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from typing import Dict, Optional
import logging
from ..config import settings

logger = logging.getLogger(__name__)

class OAuthHandler:
    """Handle Google OAuth 2.0 authentication"""
    
    @staticmethod
    def get_google_auth_url(state: str) -> str:
        """Generate Google OAuth authorization URL"""
        try:
            flow = Flow.from_client_config(
                client_config={
                    "web": {
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
                    }
                },
                scopes=[
                    "openid",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/userinfo.profile"
                ]
            )
            flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
            
            authorization_url, _ = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=state,
                prompt='consent'
            )
            
            return authorization_url
        except Exception as e:
            logger.error(f"Error generating Google auth URL: {e}")
            raise
    
    @staticmethod
    def verify_google_token(code: str) -> Optional[Dict]:
        """Verify Google OAuth token and extract user info"""
        try:
            flow = Flow.from_client_config(
                client_config={
                    "web": {
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
                    }
                },
                scopes=[
                    "openid",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/userinfo.profile"
                ]
            )
            flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
            
            # Exchange authorization code for credentials
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Verify ID token
            id_info = id_token.verify_oauth2_token(
                credentials.id_token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            return {
                "email": id_info.get("email"),
                "given_name": id_info.get("given_name"),
                "family_name": id_info.get("family_name"),
                "picture": id_info.get("picture"),
                "email_verified": id_info.get("email_verified", False)
            }
        except Exception as e:
            logger.error(f"Error verifying Google token: {e}")
            return None
