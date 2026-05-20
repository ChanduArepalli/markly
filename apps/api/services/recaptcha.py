import logging
from typing import Optional
from fastapi import HTTPException, status
import httpx

from config import settings

logger = logging.getLogger("markly.recaptcha")

async def verify_recaptcha(token: Optional[str], action: str) -> None:
    """
    Verify Google reCAPTCHA v3 token.
    If RECAPTCHA_SECRET_KEY is not configured, verification is skipped (development mode fallback).
    """
    secret_key = settings.RECAPTCHA_SECRET_KEY
    if not secret_key:
        logger.warning(
            "reCAPTCHA verification skipped: RECAPTCHA_SECRET_KEY is not configured."
        )
        return

    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reCAPTCHA token is required for verification.",
        )

    verify_url = "https://www.google.com/recaptcha/api/siteverify"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                verify_url,
                data={
                    "secret": secret_key,
                    "response": token,
                },
                timeout=5.0
            )
            response.raise_for_status()
            res_data = response.json()
    except Exception as e:
        logger.error(f"Failed to communicate with reCAPTCHA verification server: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to verify security captcha. Please try again later.",
        )

    success = res_data.get("success", False)
    if not success:
        error_codes = res_data.get("error-codes", [])
        logger.warning(f"reCAPTCHA verification failed. Errors: {error_codes}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security captcha verification failed. Please try again.",
        )

    score = res_data.get("score", 0.0)
    res_action = res_data.get("action", "")

    # Verify that the action matches to prevent cross-action replay attacks (case-insensitive)
    if res_action and res_action.lower() != action.lower():
        logger.warning(f"reCAPTCHA action mismatch: expected '{action}', got '{res_action}'")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request action context.",
        )

    if score < settings.RECAPTCHA_MIN_SCORE:
        logger.warning(f"reCAPTCHA score {score} is below threshold {settings.RECAPTCHA_MIN_SCORE}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Security verification identified automated activity. Access denied.",
        )

    logger.info(f"reCAPTCHA verified successfully for action '{action}' with score {score}")
