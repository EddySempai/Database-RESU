import zipfile
import xml.etree.ElementTree as ET
import json

def parse_xlsx(filepath):
    with zipfile.ZipFile(filepath, 'r') as archive:
        shared_strings = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            with archive.open('xl/sharedStrings.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                # Find all 't' tags which contain the text
                for si in root.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    texts = [t.text for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text]
                    shared_strings.append(''.join(texts))

        with archive.open('xl/worksheets/sheet1.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            rows = []
            for row in root.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                current_row = []
                for cell in row.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    val = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    inline_str = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is')
                    
                    if val is not None:
                        t = cell.get('t')
                        if t == 's':
                            idx = int(val.text)
                            current_row.append(shared_strings[idx] if idx < len(shared_strings) else f"ERR:{idx}")
                        else:
                            current_row.append(val.text)
                    elif inline_str is not None:
                        texts = [t.text for t in inline_str.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text]
                        current_row.append(''.join(texts))
                    else:
                        current_row.append('')
                rows.append(current_row)
            
            with open('src/habilidades_dump.json', 'w', encoding='utf-8') as out:
                json.dump(rows, out, ensure_ascii=False, indent=2)

try:
    parse_xlsx('src/Base_Datos_Habilidades_Resident_Evil.xlsx')
    print("Parsed successfully!")
except Exception as e:
    print(f"Error parsing: {e}")
