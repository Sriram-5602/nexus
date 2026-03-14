from fastapi import FastAPI

app = FastAPI(title="Nexus Cortex", root_path="/cortex")


@app.get("/cortex/status")
async def status():
    return {"status": "ok", "service": "cortex"}
