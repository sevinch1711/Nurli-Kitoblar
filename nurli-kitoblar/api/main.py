import os
import uuid
import shutil
import pdfplumber
import edge_tts
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

def clear_temp_folder():
    """temp_audio papkasidagi barcha eski fayllarni o'chirish"""
    for filename in os.listdir(TEMP_DIR):
        file_path = os.path.join(TEMP_DIR, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Faylni ochirishda xato {file_path}: {e}')

@app.post("/api/convert")
async def convert_pdf(
    file: UploadFile = File(...),
    start: int = Form(...),
    end: int = Form(...),
    voice: str = Form("uz-UZ-MadinaNeural")
):
    # 💡 YANGI: Har safar yangi so'rov kelganda eski fayllarni tozalaymiz
    clear_temp_folder()

    session_id = str(uuid.uuid4())
    temp_pdf = f"{session_id}.pdf"
    output_audio = os.path.join(TEMP_DIR, f"{session_id}.mp3")

    try:
        with open(temp_pdf, "wb") as buffer:
            buffer.write(await file.read())

        extracted_text = ""
        with pdfplumber.open(temp_pdf) as pdf:
            pages = pdf.pages[start-1 : end]
            for page in pages:
                extracted_text += (page.extract_text() or "") + " "

        if len(extracted_text.strip()) < 5:
            raise HTTPException(status_code=400, detail="Matn topilmadi")

        communicate = edge_tts.Communicate(extracted_text, voice)
        await communicate.save(output_audio)

        return FileResponse(output_audio, media_type="audio/mpeg")

    except Exception as e:
        print(f"Xato: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_pdf):
            os.remove(temp_pdf)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)