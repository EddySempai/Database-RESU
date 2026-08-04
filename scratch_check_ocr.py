import subprocess

try:
  import PIL
  print('PIL available:', PIL.__version__)
except Exception as e:
  print('PIL not available:', e)

try:
  import pytesseract
  print('pytesseract available')
except Exception as e:
  print('pytesseract not available:', e)

try:
  import easyocr
  print('easyocr available')
except Exception as e:
  print('easyocr not available:', e)
