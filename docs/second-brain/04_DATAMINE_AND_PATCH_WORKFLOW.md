# 📦 Flujo de Datamine y Registro de Parches

## 1. Procedimiento de Extracción de Nuevas Versiones (`D:\Proyecto de juego`)
1. Descomprimir el archivo `.apk` o `.xapk` de la nueva versión en `D:\Proyecto de juego\<version>`.
2. Ejecutar `extract_patched.py` (con el parche de `fsspec` para Unity 6) para extraer todos los `Sprite` y `Texture2D` a formato `.webp`.
3. Ejecutar `extract_audio.py` para extraer `AudioClip` a `.wav`.
4. Ejecutar `organize.py` para clasificar por prefijo (`Icon`, `Char`, `Skin`, `Event`, `Banner`, `Weapon`, etc.).
5. Ejecutar `cleanup_duplicates.py` comparando contra la versión base para conservar únicamente los archivos 100% nuevos de ese parche.
6. **Extracción sin pérdida de `TextAsset` (`data.bundle` — Tablas y Localización):**
   - En UnityPy, **nunca** usar `m_Script.encode('utf-8', errors='ignore')` porque elimina los bytes `>= 0x80` del flujo binario LZ4/MessagePack.
   - Usar siempre `raw = obj.read().m_Script.encode('utf-8', 'surrogateescape')`:
     - Para hojas de datos (`*Sheet`): descomprimir el bloque `ExtType(99)` con `lz4.block.decompress` y desempaquetar con `msgpack.unpackb`.
     - Para localización (`LocalizeText_*_Spa`, `LocalizeText_*_Eng`): desempaquetar directamente el array `[key, value]` con `msgpack.unpackb(raw, strict_map_key=False)`.

## 2. Historial de Parches Extraídos
### Versión `1.10.1` (`D:\Proyecto de juego\cosas_v1_10_1\Sprite`)
- **Total de activos nuevos únicos:** 507 imágenes `.webp` y 24 audios `.wav`.
- **Skins de Base y Marcha:** `SKIN_HQ_34.webp` (y variante `Add`), `SKIN_HQ_35.webp`, `Skin_March_34.webp`, `Skin_March_35.webp`, `Skin_Frame33/34/35`, `Skin_Title34/35`.
- **Eventos Nuevos:** `Event_BingoSeason01_bg_C.webp`, `Bingo_Bg_Season_01_C.webp`, `Bingo_Bg_Season_02_C.webp`, `SeasonRecharge_Bg_S_C.webp`.
- **Banners Hot Time:** `Banner_Hottime_Build_Main.webp`, `Banner_Hottime_Research_Main.webp`, `Banner_Hottime_Troop_Main.webp`.
- **Tienda:** `LinkStore_Item_Roulette_Ticket_Gold.webp`.
- **Gran Despliegue de las 3 Fases Tácticas:** Integración de Fase 1 (Mansión P1–P10 con recursos comunes y tiempos base, Luminio, Tesoros y Joyas calibradas, y guía en `/guias/mansion-nivel-1-a-30`), Fase 2 (Centro de Conversores Tácticos en `/conversores` con Tienda de Intercambio, Aceleradores y Mochila Segura) y Fase 3 (Base de Datos de 42 Llaveros en `/llaveros`, curva de 193,790 EXP a Nv.30, tabla de CP de 255K y 96 sub-estadísticas con mecánica del 20%). Noticia editorial de portada publicada en `/noticias/gran-actualizacion-3-fases-wiki`.
- **Iconografía Oficial de Recursos y Equipamiento:**
  - `Item_Custom_Box_Equipment_02.webp`: Maletín de Arma Legendaria a Elección (Tier 10+ en `/operativos`).
  - `Item_Food.webp`: Saco de Comida / Granos (utilizado en `/herramientas` > Mansión y `/conversores`).
  - `Item_Wood.webp`: Tablones de Madera con precinto de seguridad.
  - `Item_Iron.webp`: Piezas y engranajes de Hierro / Bloque motor.
  - `Item_Oil.webp`: Bidón de Gasolina / Petróleo rojo de 20L.
