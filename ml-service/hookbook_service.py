import re, pronouncing, pyphen

_dic = pyphen.Pyphen(lang="en_US")

def count_syllables_word(word):
    clean = re.sub(r"[^a-zA-Z']", "", word.lower())
    if not clean: return 0
    phones = pronouncing.phones_for_word(clean)
    if phones: return pronouncing.syllable_count(phones[0])
    hyph = _dic.inserted(clean)
    return max(1, hyph.count("-") + 1)

def analyze_line_syllables(line):
    words = re.findall(r"[\w']+", line)
    breakdown = [{"word": w, "syllables": count_syllables_word(w)} for w in words]
    return {"line": line, "total": sum(b["syllables"] for b in breakdown), "breakdown": breakdown}

def analyze_lines_syllables(lines):
    return [analyze_line_syllables(l) for l in lines if l.strip()]

def get_rhymes(word, limit=20):
    return pronouncing.rhymes(re.sub(r"[^a-zA-Z']","",word.lower()))[:limit]

def get_near_rhymes(word, limit=20):
    clean = re.sub(r"[^a-zA-Z']","",word.lower())
    phones_list = pronouncing.phones_for_word(clean)
    if not phones_list: return []
    phones = phones_list[0]
    rp_ours = pronouncing.rhyming_part(phones)
    if not rp_ours: return []
    our_vowel = re.sub(r"\d","", rp_ours.split()[0]) if rp_ours.split() else ""
    near = []
    perfect = set(pronouncing.rhymes(clean))
    for ew, ep_list in pronouncing.cmudict().items():
        for ep in ep_list:
            rp = pronouncing.rhyming_part(ep)
            if rp and rp != rp_ours:
                v = re.sub(r"\d","", rp.split()[0]) if rp.split() else ""
                if v == our_vowel and ew != clean and ew not in perfect:
                    near.append(ew)
                    break
        if len(near) >= limit: break
    return near[:limit]

def get_stress_pattern(line):
    words = re.findall(r"[\w']+", line.lower())
    parts = []
    for word in words:
        pl = pronouncing.phones_for_word(word)
        if not pl:
            parts.extend(["U"] * count_syllables_word(word))
            continue
        for s in pronouncing.stresses(pl[0]):
            parts.append("/" if s=="1" else ("+" if s=="2" else "U"))
    return " ".join(parts)

def classify_meter(pattern):
    c = pattern.replace(" ","").replace("+","U")
    feet = {"U/":("iambic",2),"/U":("trochaic",2),"UU/":("anapestic",3),"/UU":("dactylic",3),"//":("spondaic",2),"UU":("pyrrhic",2)}
    deg = {2:"dimeter",3:"trimeter",4:"tetrameter",5:"pentameter",6:"hexameter",7:"heptameter",8:"octameter"}
    best,score,fsize = None,0,2
    for fp,(name,sz) in feet.items():
        cnt,i = 0,0
        while i <= len(c)-sz:
            if c[i:i+sz]==fp: cnt+=1; i+=sz
            else: i+=1
        s = cnt / max(1, len(c)/sz)
        if s > score: score=s; best=name; fsize=sz
    if score < 0.4: return "free verse"
    nfeet = round(len(c)/fsize)
    suffix = deg.get(nfeet, str(nfeet)+"-foot"); return f"{best} {suffix}"

def detect_end_rhyme_scheme(lines):
    end_words = []
    for line in lines:
        ws = re.findall(r"[\w']+", line.lower())
        end_words.append(ws[-1] if ws else "")
    letters=[]; groups={}; idx=0; alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for word in end_words:
        matched=None
        for rep,letter in groups.items():
            if word in set(get_rhymes(rep,50)) | {rep} or rep in set(get_rhymes(word,50)):
                matched=letter; break
        if matched: letters.append(matched)
        else:
            nl=alpha[idx%26]; groups[word]=nl; letters.append(nl); idx+=1
    return "".join(letters)

def _detect_alliteration(lines):
    hits=[]
    for i,line in enumerate(lines):
        ws=[w for w in re.findall(r"[\w']+",line.lower()) if len(w)>2]
        for letter in set(w[0] for w in ws):
            m=[w for w in ws if w[0]==letter]
            if len(m)>=2: hits.append({"line":i+1,"device":"alliteration","letter":letter.upper(),"words":m})
    return hits

def _detect_assonance(lines):
    hits=[]
    for i,line in enumerate(lines):
        ws=re.findall(r"[\w']+",line.lower())
        for v in "aeiou":
            m=[w for w in ws if v in w and len(w)>2]
            if len(m)>=3: hits.append({"line":i+1,"device":"assonance","vowel":v,"words":m}); break
    return hits

def _detect_anaphora(lines):
    hits=[]
    for i in range(len(lines)-1):
        w1=re.findall(r"[\w']+",lines[i].lower())
        w2=re.findall(r"[\w']+",lines[i+1].lower())
        if w1 and w2 and w1[0]==w2[0]: hits.append({"lines":[i+1,i+2],"device":"anaphora","word":w1[0]})
    return hits

def _detect_epistrophe(lines):
    hits=[]
    for i in range(len(lines)-1):
        w1=re.findall(r"[\w']+",lines[i].lower())
        w2=re.findall(r"[\w']+",lines[i+1].lower())
        if w1 and w2 and w1[-1]==w2[-1]: hits.append({"lines":[i+1,i+2],"device":"epistrophe","word":w1[-1]})
    return hits

def detect_devices(lines):
    return {"alliteration":_detect_alliteration(lines),"assonance":_detect_assonance(lines),"anaphora":_detect_anaphora(lines),"epistrophe":_detect_epistrophe(lines)}

INTENTIONAL = [
    (r"\bain't\b","Colloquial contraction -- artistically valid"),
    (r"\bgonna\b|\bwanna\b|\bgotta\b","Casual speech compression -- valid in lyrics"),
    (r"\b'cause\b|\b'til\b|\b'em\b","Lyrical elision -- valid"),
    (r"\bain't got no\b|\bnever no\b","Double negative -- valid stylistic choice"),
    (r"\b(I|you|we|they)\s+be\b","AAVE habitual be -- culturally valid"),
]
GRAMMAR_FLAGS = [
    (r"\b(they|we|you)\s+was\b","Subject-verb agreement: consider were","agreement"),
    (r"\b(he|she|it)\s+were\b","Subject-verb agreement: consider was","agreement"),
    (r"\b(I|he|she|they)\s+seen\b","Missing auxiliary: have seen or saw","tense"),
    (r"\bshould\s+of\b|\bcould\s+of\b|\bwould\s+of\b","Spelling: of should be have","spelling"),
]

def grammar_check(text, artistic_mode=True):
    lines=text.split("\n"); notes=[]; flags=[]
    for line in lines:
        if artistic_mode:
            for pat,note in INTENTIONAL:
                if re.search(pat,line,re.IGNORECASE): notes.append({"line":line.strip(),"note":note})
        for pat,sug,cat in GRAMMAR_FLAGS:
            if re.search(pat,line,re.IGNORECASE): flags.append({"line":line.strip(),"issue":sug,"category":cat,"severity":"soft"})
    return {"intentional":notes,"flags":flags,"clean":len(flags)==0,"artistic_mode":artistic_mode}

SYNONYMS = {"love":["heart","ache","feel","need","want","crave","adore","yearn"],"hate":["burn","seethe","loathe","despise","resent","rage","scorn"],"pain":["ache","wound","hurt","scar","bleed","sting","bruise","grief"],"fear":["dread","doubt","dark","shake","freeze","cower","tremble"],"hope":["light","rise","dream","reach","climb","trust","faith","spark"],"lost":["adrift","hollow","broke","numb","blind","grey","scattered"],"free":["loose","wild","open","bare","clear","vast","bright"],"run":["flee","chase","drift","escape","race","sprint","vanish"],"home":["roots","ground","place","soil","shelter","anchor","refuge"],"time":["days","clock","dusk","tide","years","now","moment","dust"],"sad":["heavy","hollow","grey","quiet","still","numb","broken","dim"],"strong":["solid","rooted","iron","fierce","bold","granite","steady"],"broken":["torn","cracked","shattered","fractured","split","undone","raw"],"fire":["flame","blaze","burn","spark","heat","glow","ember"],"water":["rain","flood","tide","wave","river","sea","flow","stream"],"rise":["climb","lift","ascend","grow","emerge","soar","reach"],"fall":["drop","sink","collapse","crumble","tumble","slide","fade"],"night":["dark","dusk","shadow","eve","deep","black","midnight"],"light":["glow","flame","dawn","spark","gleam","radiance","sun","beam"],"heart":["soul","core","chest","pulse","blood","spirit","center"],"road":["path","way","trail","journey","course","track","bridge"]}

def suggest_synonyms(word, limit=8):
    c=word.lower().strip()
    if c in SYNONYMS: return SYNONYMS[c][:limit]
    for k,v in SYNONYMS.items():
        if k in c or c in k: return v[:limit]
    return []

def score_verse_coherence(lines):
    if not lines: return {"score":0,"notes":["No lines"]}
    notes=[]; score=100
    syl_data=analyze_lines_syllables(lines)
    totals=[d["total"] for d in syl_data if d["total"]>0]
    if totals:
        variance=max(totals)-min(totals)
        if variance>6: score-=15; notes.append(f"Syllable variance high ({min(totals)}-{max(totals)}): consider balancing")
        elif variance>3: score-=5; notes.append(f"Slight syllable variance ({min(totals)}-{max(totals)})")
    scheme=detect_end_rhyme_scheme(lines)
    if len(set(scheme))==len(scheme): score-=20; notes.append("No end rhymes detected")
    else: notes.append(f"Rhyme scheme: {scheme}")
    devices=detect_devices(lines)
    active=[k for k,v in devices.items() if v]
    if not active: score-=10; notes.append("No literary devices detected")
    else: notes.append(f"Devices: {', '.join(active)}")
    short=[d for d in syl_data if 0<d["total"]<4]
    if short: score-=5; notes.append(f"{len(short)} line(s) very short")
    return {"score":max(0,score),"notes":notes,"scheme":scheme}