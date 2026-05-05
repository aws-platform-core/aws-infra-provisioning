from typing import Any, Literal, Optional
from pydantic import BaseModel

class ShowWhen(BaseModel):
    field: str
    equals: Any

class TemplateField(BaseModel):
    name: str
    label: str
    type: Literal["string", "number", "boolean", "select"]
    required: Optional[bool] = False
    default: Any = None
    options: Optional[list[str]] = None
    placeholder: Optional[str] = None
    helperText: Optional[str] = None
    pattern: Optional[str] = None
    patternErrorMessage: Optional[str] = None
    estimationOnly: Optional[bool] = False
    min: Optional[float] = None
    max: Optional[float] = None
    showWhen: Optional[ShowWhen] = None

class Template(BaseModel):
    id: str
    provider: str
    name: str
    description: str
    category: str
    terraform_module_path: str
    parameters: list[TemplateField]