from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SupplyIQ API"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./supplyiq_demo.db"
    secret_key: str = "local-development-key"
    backend_cors_origins: str = "http://localhost:5173,http://localhost:4173"
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [value.strip() for value in self.backend_cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

