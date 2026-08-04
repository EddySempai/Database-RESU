import zipfile
import xml.etree.ElementTree as ET

def read_xlsx(filename):
    with zipfile.ZipFile(filename, 'r') as z:
        # shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                t = si.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                if t is not None:
                    shared_strings.append(t.text)
                else:
                    shared_strings.append(''.join([node.text for node in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if node.text]))

        # sheet 1
        sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = []
        for row in sheet_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_data = []
            for cell in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                v = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                t = cell.get('t')
                val = v.text if v is not None else ''
                if t == 's' and val != '':
                    val = shared_strings[int(val)]
                row_data.append(val)
            rows.append(row_data)
        return rows

rows = read_xlsx('scripts/raw-data/Base_Datos_Habilidades_Resident_Evil.xlsx')
print(f"Total rows in Base_Datos_Habilidades_Resident_Evil.xlsx: {len(rows)}")
for r in rows:
    print(r)
