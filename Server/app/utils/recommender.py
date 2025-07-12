# recommendation/recommender.py
from typing import List, Dict, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer


class JobRecommender:
    def __init__(self, db):
        self.db = db
        self.vectorizer = TfidfVectorizer()

    async def get_recommendations(
        self, user_id: str, limit: int = 10
    ) -> List[Tuple[str, float]]:
        """
        Returns: List of (job_id, similarity_score) tuples
        """
        # Get user data
        user = await self.db.users.find_one({"_id": user_id})
        user_skills = set(user.get("skills", []))
        user_prefs = user.get("preferences", {})

        # Get all active jobs (excluding swiped)
        swiped_jobs = [s["job"] async for s in self.db.swipes.find({"user": user_id})]

        jobs = []
        async for job in self.db.jobs.find({"_id": {"$nin": swiped_jobs}}):
            # Calculate content similarity
            content_score = self._calculate_content_similarity(
                user_skills, user_prefs, job
            )

            # Calculate popularity score (normalized 0-1)
            popularity_score = await self._get_popularity_score(job["_id"])

            # Combined score (adjust weights as needed)
            combined_score = 0.7 * content_score + 0.3 * popularity_score

            jobs.append((str(job["_id"]), combined_score, content_score))

        # Sort by combined score
        jobs.sort(key=lambda x: x[1], reverse=True)
        return [
            (job[0], job[2]) for job in jobs[:limit]
        ]  # Return (job_id, similarity_score)

    def _calculate_content_similarity(
        self, user_skills: set, user_prefs: dict, job: dict
    ) -> float:
        """Calculate skill/preference match score (0-1)"""
        # Skill overlap
        job_skills = set(job.get("skillsRequired", []))
        skill_match = len(user_skills & job_skills) / max(1, len(job_skills))

        # Preference match
        pref_match = (
            1.0 if job.get("jobType") in user_prefs.get("jobTypes", []) else 0.5
        )

        # Location match
        location_match = (
            1.0
            if job.get("isRemote") == (user_prefs.get("locationType") == "remote")
            else 0.7
        )

        return skill_match * 0.6 + pref_match * 0.2 + location_match * 0.2

    async def _get_popularity_score(self, job_id: str) -> float:
        """Get normalized popularity score (0-1)"""
        like_count = await self.db.swipes.count_documents(
            {"job": job_id, "action": "like"}
        )
        # Normalize using sigmoid function
        return 1 / (1 + np.exp(-like_count / 10))  # Adjust denominator for scaling
