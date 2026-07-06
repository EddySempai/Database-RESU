import json

def merge_skills():
    try:
        with open('src/habilidades_dump.json', 'r', encoding='utf-8') as f:
            dump_rows = json.load(f)
            
        with open('src/data/operativos.json', 'r', encoding='utf-8') as f:
            operativos = json.load(f)

        skills_map = {}
        for row in dump_rows[1:]:
            if len(row) < 6:
                continue
            personaje = row[0].strip()
            tipo = row[2].strip()
            nombre = row[3].strip()
            desc = row[5].strip()
            
            if tipo.lower() == 'general' or nombre.lower() == 'info base':
                continue
                
            if personaje not in skills_map:
                skills_map[personaje] = []
                
            skills_map[personaje].append({
                'type': tipo,
                'name': nombre,
                'description': desc
            })

        for op in operativos:
            op_name = op.get('name', '').strip()
            if op_name in skills_map:
                op['skills'] = skills_map[op_name]
            else:
                op['skills'] = []

        with open('src/data/operativos.json', 'w', encoding='utf-8') as f:
            json.dump(operativos, f, ensure_ascii=False, indent=2)

        print("Merged skills successfully!")
    except Exception as e:
        print(f"Error merging skills: {e}")

merge_skills()
