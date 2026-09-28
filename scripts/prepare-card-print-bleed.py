"""Reimpose original 12.06 cards at 100% with 3 mm bleed and crop marks.
Sources are read-only. Main card faces remain unchanged PDF vector/text/image
content. Only each outer 0.1 mm edge is extrapolated into disposable bleed.
Six cards per A4 sheet leave 8 mm gutters; marks stay outside all card bleed.
Back columns are mirrored for long-edge duplex printing.
"""
from __future__ import annotations
import argparse, hashlib, io, json, math, re
from pathlib import Path
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, ContentStream, DecodedStreamObject, DictionaryObject, FloatObject, NameObject
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT=Path(__file__).resolve().parents[1]
W,H=A4
CW,CH=63*mm,88*mm
BLEED,EDGE,GAP=3*mm,.1*mm,8*mm
X0=(W-(2*CW+GAP))/2
Y0=(H-(3*CH+2*GAP))/2
ID_PATTERN=re.compile(r'\b[A-Z]{3}-\d{2}\b')


def source_box(row,col):
    return ((8.5+col*65)*mm,(14.5+(2-row)*90)*mm,CW,CH)


def text_in_cell(page,row,col):
    x,y,w,h=source_box(row,col)
    return page.within_bbox((x,H-y-h,x+w,H-y),strict=False).extract_text() or ''


def collect_cards(path):
    records=[]
    with pdfplumber.open(path) as pdf:
        for index in range(2,len(pdf.pages),2):
            for row in range(3):
                for col in range(3):
                    text=text_in_cell(pdf.pages[index],row,col)
                    ids=set(ID_PATTERN.findall(text))
                    if not ids:continue
                    if len(ids)!=1:raise ValueError(f'{path.name} page{index+1} cell{row,col}: {ids}')
                    card_id=ids.pop()
                    back_text=text_in_cell(pdf.pages[index+1],row,2-col)
                    back_ids=set(ID_PATTERN.findall(back_text))
                    if back_ids and back_ids!={card_id}:raise ValueError(f'Wrong reverse for {card_id}: {back_ids}')
                    records.append(dict(id=card_id,front_page=index,back_page=index+1,row=row,col=col,back_col=2-col,front_text=text,back_text=back_text,text_back=bool(back_ids)))
    assert len(records)==147,len(records)
    assert len({item['id'] for item in records})==147
    return records


def cover(variant,records):
    memory=io.BytesIO();c=canvas.Canvas(memory,pagesize=A4)
    dark=HexColor('#182b39');gold=HexColor('#c49136')
    c.setFillColor(dark);c.rect(0,H-40*mm,W,40*mm,stroke=0,fill=1)
    c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica-Bold',22)
    c.drawString(17*mm,H-20*mm,'DOMAIN POWER CARDS')
    c.setFont('Helvetica',10)
    c.drawString(17*mm,H-29*mm,'COREBOOK 12.06  /  '+('COLOR' if variant=='color' else 'PRINT FRIENDLY'))
    c.setFillColor(gold);c.rect(17*mm,H-46*mm,20*mm,1.4*mm,stroke=0,fill=1)
    style=ParagraphStyle('body',fontName='Helvetica',fontSize=10.2,leading=14.8,textColor=dark)
    small=ParagraphStyle('small',parent=style,fontSize=8,leading=11)
    y=H-54*mm
    def paragraph(text,spacing=4*mm,sty=style):
        nonlocal y
        p=Paragraph(text,sty);_,height=p.wrap(W-34*mm,H)
        p.drawOn(c,17*mm,y-height);y-=height+spacing
    paragraph('<b>147 cards. Original 63 x 88 mm trim size. 3 mm bleed on every side.</b> Six cards per A4 sheet; 25 double-sided sheets. These files contain 52 pages, including this instruction page and its blank reverse.')
    paragraph('<b>PRINT / IMPRIMIR</b><br/>Print <b>pages 3-52</b>, in order, A4 portrait, <b>actual size / 100%</b>, double-sided, <b>flip on the long edge</b>. Disable fit-to-page and extra pages per sheet. Test one front/back pair before printing the complete deck.<br/>Imprime las <b>pÃ¡ginas 3-52</b>, en orden, A4 vertical, <b>tamaÃ±o real / 100%</b>, a doble cara y con <b>giro por el borde largo</b>. Desactiva ajustar a pÃ¡gina y no aÃ±adas mÃ¡s pÃ¡ginas por hoja. Prueba primero una pareja de anverso y reverso.')
    paragraph('<b>CUT / RECORTAR</b><br/>The outside crop marks define a 63 x 88 mm cutting grid. Cut along the marks, not around the outer bleed. The 3 mm bleed and the 8 mm gutters are discarded. White card edges intentionally have white bleed; only the backgrounds continue beyond the trim.<br/>Las marcas exteriores definen una cuadrÃ­cula de corte de 63 x 88 mm. Corta siguiendo las marcas, no el borde del sangrado. Se descartan los 3 mm de sangrado y las separaciones de 8 mm.')
    back_count=sum(r['text_back'] for r in records)
    backing='illustrated' if variant=='color' else 'VeilFarers logo'
    paragraph(f'<b>BACKS / REVERSOS</b><br/>{147-back_count} {backing} backs and {back_count} rules continuations. Each front is followed by its matching reverse; back columns are mirrored for duplex printing. A power using both sides is still one Loadout card.<br/>Cada anverso va seguido de su reverso correspondiente. Las columnas del reverso estÃ¡n invertidas para la impresiÃ³n a doble cara. Un poder a dos caras sigue siendo una sola carta de Loadout.')
    paragraph('<b>Contents / Contenido:</b> Tech, Synthesis, Social, Neural, Kinetic, Void and Lux - 21 cards each. All 147 original English powers are preserved; card text and artwork have not been resized.',sty=small)
    y-=2*mm;c.setStrokeColor(dark);c.setLineWidth(.5)
    c.line(17*mm,y,67*mm,y);c.line(17*mm,y-1.5*mm,17*mm,y+1.5*mm);c.line(67*mm,y-1.5*mm,67*mm,y+1.5*mm)
    c.setFont('Helvetica',8);c.setFillColor(dark);c.drawString(72*mm,y-1*mm,'Scale check / Escala: 50 mm');y-=10*mm
    paragraph('VeilFarers, its setting, characters, and all original content (c) 2026 Pedro Almagro Torrecillas. All rights reserved. Layout and art direction: Altor Design &amp; Solutions. Original cards typeset in Aller (Dalton Maag). Source: Corebook 12.06, Chapter 19.',sty=small)
    paragraph('This product includes materials from the Daggerheart System Reference Document 1.0, (c) Critical Role, LLC, under the Darrington Press Community Gaming License (DPCGL). www.daggerheart.com. Daggerheart and Darrington Press are trademarks of Critical Role, LLC. This independent work is not affiliated with, endorsed, or sponsored by Darrington Press or Critical Role.',sty=small)
    assert y>12*mm,y
    c.showPage();c.showPage();c.save();memory.seek(0)
    return PdfReader(memory)


def number(value):return f'{value:.6f}'


def paint_slice(form,sx,sy,sw,sh,tx,ty,tw,th):
    # Main faces use scale 1. Stretching is confined to the disposable bleed.
    a,d=tw/sw,th/sh;e,f=tx-a*sx,ty-d*sy
    values=' '.join(number(v) for v in [tx,ty,tw,th])
    matrix=' '.join(number(v) for v in [a,0,0,d,e,f])
    return f'q {values} re W n {matrix} cm /{form} Do Q\n'


def render_card(form,source,destination):
    sx,sy,_,_=source;tx,ty=destination;out=[]
    for ix,(source_x,source_w,dest_x,dest_w) in enumerate([(sx,EDGE,tx-BLEED,BLEED),(sx,CW,tx,CW),(sx+CW-EDGE,EDGE,tx+CW,BLEED)]):
        for iy,(source_y,source_h,dest_y,dest_h) in enumerate([(sy,EDGE,ty-BLEED,BLEED),(sy,CH,ty,CH),(sy+CH-EDGE,EDGE,ty+CH,BLEED)]):
            if ix==1 and iy==1:continue
            out.append(paint_slice(form,source_x,source_y,source_w,source_h,dest_x,dest_y,dest_w,dest_h))
    out.append(paint_slice(form,sx,sy,CW,CH,tx,ty,CW,CH))
    return ''.join(out)


def marks(sheet,side,total):
    commands=['q 0 G .35 w\n']
    x_edges=[X0,X0+CW,X0+CW+GAP,X0+2*CW+GAP]
    y_edges=sorted({Y0+row*(CH+GAP)+edge for row in range(3) for edge in [0,CH]})
    offset,length=3.7*mm,2*mm
    for y in y_edges:
        for sign,x in [(-1,x_edges[0]),(1,x_edges[-1])]:
            commands.append(f'{number(x+sign*offset)} {number(y)} m {number(x+sign*(offset+length))} {number(y)} l S\n')
    for x in x_edges:
        for sign,y in [(-1,y_edges[0]),(1,y_edges[-1])]:
            commands.append(f'{number(x)} {number(y+sign*offset)} m {number(x)} {number(y+sign*(offset+length))} l S\n')
    for x in [18*mm,W-18*mm]:
        y=H/2
        commands.append(f'{number(x-2*mm)} {number(y)} m {number(x+2*mm)} {number(y)} l S {number(x)} {number(y-2*mm)} m {number(x)} {number(y+2*mm)} l S\n')
    label=f'VEILFARERS 12.06 / SHEET {sheet:02d}-{total:02d} / {side.upper()} / A4 100% / LONG EDGE / 3 MM BLEED'
    commands.append(f'0 g BT /Label 6 Tf 0 1 -1 0 {number(10*mm)} {number(34*mm)} Tm ({label}) Tj ET Q\n')
    return ''.join(commands)


def isolated_illustrated_back(source_page,box,reader):
    # Ordinary color backs contain one background rectangle and one image.
    # Isolate those original operations to avoid repeatedly rendering the
    # eight adjacent backs hidden by the imposition clip.
    operations=source_page.get_contents().operations
    for index,(operands,operator) in enumerate(operations):
        if operator!=b're' or len(operands)!=4:continue
        if not all(abs(float(actual)-expected)<.002 for actual,expected in zip(operands,box)):continue
        end=next(i for i in range(index+1,len(operations)) if operations[i][1]==b'Q')
        selected=operations[index-2:end+1]
        assert selected[0][1]==b'rg' and selected[1][1]==b'n'
        assert sum(operator==b'Do' for _,operator in selected)==1
        stream=ContentStream(None,reader);stream.operations=selected
        return stream.get_data()
    raise ValueError(f'Cannot isolate illustrated back at {box}')


def build(source,output,variant):
    records=collect_cards(source)
    reader=PdfReader(source);writer=PdfWriter()
    for page in cover(variant,records).pages:writer.add_page(page)
    font=writer._add_object(DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')}))
    forms={}
    for index in sorted({r[key] for r in records for key in ['front_page','back_page']}):
        source_page=reader.pages[index]
        form=DecodedStreamObject();form.set_data(source_page.get_contents().get_data())
        form.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Form'),NameObject('/FormType'):FloatObject(1),NameObject('/BBox'):ArrayObject([FloatObject(v) for v in [0,0,W,H]]),NameObject('/Resources'):source_page['/Resources'].clone(writer)})
        forms[index]=writer._add_object(form.flate_encode())
    back_forms={}
    if variant=='color':
        for record in records:
            if record['text_back']:continue
            index=record['back_page'];source_page=reader.pages[index]
            box=source_box(record['row'],record['back_col'])
            form=DecodedStreamObject();form.set_data(isolated_illustrated_back(source_page,box,reader))
            form.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Form'),NameObject('/FormType'):FloatObject(1),NameObject('/BBox'):ArrayObject([FloatObject(v) for v in [0,0,W,H]]),NameObject('/Resources'):source_page['/Resources'].clone(writer)})
            back_forms[record['id']]=writer._add_object(form.flate_encode())
    sheets=math.ceil(len(records)/6);placements=[]
    for sheet in range(sheets):
        batch=records[sheet*6:(sheet+1)*6]
        for side in ['front','back']:
            page=writer.add_blank_page(width=W,height=H);refs=DictionaryObject();commands=[]
            for slot,record in enumerate(batch):
                row,col=divmod(slot,2)
                if side=='back':col=1-col
                target=(X0+col*(CW+GAP),Y0+(2-row)*(CH+GAP))
                index=record[side+'_page'];name=f'Source{index}'
                if side=='back' and record['id'] in back_forms:
                    name='Card'+record['id'].replace('-','')
                    refs[NameObject('/'+name)]=back_forms[record['id']]
                else:
                    refs[NameObject('/'+name)]=forms[index]
                source_col=record['col'] if side=='front' else record['back_col']
                commands.append(render_card(name,source_box(record['row'],source_col),target))
                tx,ty=target
                commands.append(f'q .3 g BT /Label 5 Tf 1 0 0 1 {number(tx+2*mm)} {number(ty-4.8*mm)} Tm ({record["id"]} / {side.upper()}) Tj ET Q\n')
                placements.append(dict(id=record['id'],side=side,page=len(writer.pages),source_page=index+1,source_box_mm=[round(v/mm,5) for v in source_box(record['row'],source_col)],trim_mm=[round(target[0]/mm,5),round(target[1]/mm,5),63,88],bleed_mm=3,text_back=record['text_back']))
            commands.append(marks(sheet+1,side,sheets))
            page[NameObject('/Resources')]=DictionaryObject({NameObject('/XObject'):refs,NameObject('/Font'):DictionaryObject({NameObject('/Label'):font})})
            stream=DecodedStreamObject();stream.set_data(''.join(commands).encode('ascii'))
            page[NameObject('/Contents')]=writer._add_object(stream.flate_encode())
    writer.add_metadata({'/Title':f'VeilFarers - Domain Power Cards - {variant.title()} - 3 mm Bleed A4','/Author':'Pedro Almagro Torrecillas / Altor Design & Solutions','/Subject':'147 original cards; 63 x 88 mm trim; 3 mm bleed; six-up A4; crop marks; long-edge duplex','/Creator':'VeilFarers card print imposition, preserving original vector card faces'})
    output.parent.mkdir(parents=True,exist_ok=True)
    with output.open('wb') as stream:writer.write(stream)
    return {'source':str(source),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'output':str(output),'output_sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'pages':len(writer.pages),'cards':147,'trim_mm':[63,88],'bleed_mm':3,'gutter_mm':8,'sheet_size':'A4','cards_per_sheet':6,'duplex':'long edge','text_backs':sum(r['text_back'] for r in records),'bleed_method':'Original outer 0.1 mm edge extrapolated into 3 mm bleed; unchanged vector content within trim.','placements':placements}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source-dir',type=Path,required=True);parser.add_argument('--output-dir',type=Path,default=ROOT/'public/download');args=parser.parse_args()
    reports=[]
    for variant,name in [('color','VeilFarers_Power_Cards_12.06_Duplex_A4.pdf'),('print-friendly','VeilFarers_Power_Cards_12.06_Print_Friendly_A4.pdf')]:
        report=build(args.source_dir/name,args.output_dir/name,variant);reports.append(report)
        print(json.dumps({k:v for k,v in report.items() if k!='placements'},indent=2),flush=True)
    report_dir=ROOT/'output/pdf';report_dir.mkdir(parents=True,exist_ok=True)
    (report_dir/'card-print-imposition.json').write_text(json.dumps(reports,indent=2),encoding='utf8')
    # The manifest publishes the exact generated bytes, never the source hash.
    manifest_path=ROOT/'public/download/downloads.json'
    manifest=json.loads(manifest_path.read_text(encoding='utf8'))
    for report in reports:
        artifact=Path(report['output'])
        item=next(item for item in manifest['items'] if item['file']=='/download/'+artifact.name)
        item.update(bytes=artifact.stat().st_size,sha256=report['output_sha256'],status='3 mm bleed + crop marks',pages=52)
        intro=('All 147 English domain powers, with colored banners and illustrated backs.' if 'Duplex' in artifact.name else 'All 147 English domain powers in a low-ink edition, retaining domain symbols and banner colors, with VeilFarers logo backs.')
        item['description']=intro+' Six cards per A4 sheet, with crop marks and 3 mm bleed. Trim size: 63 \u00d7 88 mm. Print pages 3-52 at 100%, double-sided, flipping on the long edge.'
    manifest['generatedAt']='2026-09-28'
    for relative in ['public/download/downloads.json','public/rules-data/downloads.json']:
        (ROOT/relative).write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf8')

if __name__=='__main__':main()
