from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFont


out = Path("output/images/weapon-skill-activation-guide.png")
out.parent.mkdir(parents=True, exist_ok=True)

W, H = 1440, 1920
img = Image.new("RGB", (W, H), "#071016")
d = ImageDraw.Draw(img)

font_path = "C:/Windows/Fonts/malgun.ttf"
bold_path = "C:/Windows/Fonts/malgunbd.ttf"
F_TITLE = ImageFont.truetype(bold_path, 58)
F_SUB = ImageFont.truetype(font_path, 25)
F_CARD = ImageFont.truetype(bold_path, 31)
F_BODY = ImageFont.truetype(font_path, 21)
F_SMALL = ImageFont.truetype(font_path, 18)

for y in range(120, H, 80):
    d.line((0, y, W, y + 120), fill="#0f2730", width=2)
for x in range(-100, W, 120):
    d.line((x, 0, x + 360, H), fill="#0d222a", width=1)

d.text((70, 52), "무기 스킬 발동 방식 도감", font=F_TITLE, fill="#fff3b0")
d.text((72, 126), "게임 안에서 각 무기가 어떤 모양으로 발동되는지 한눈에 보는 참고 이미지", font=F_SUB, fill="#9bf6ff")

weapons = [
    ("회전날", "주인공 주변을 계속 회전", "접근한 적에게 지속 타격", "orbit"),
    ("민원 번개", "가까운 적에게 주기적 낙뢰", "즉시 단일/다중 타격", "lightning"),
    ("교통카드 투척", "앞으로 날아갔다가 돌아옴", "왕복하며 관통 공격", "card"),
    ("민원 폭탄", "적 많은 곳에 경고 원 생성", "잠시 후 범위 폭발", "bomb"),
    ("스크린도어 레이저", "가로/세로 긴 레이저 발사", "직선 범위 관통", "laser"),
    ("손잡이 회오리", "손잡이가 넓은 궤도로 회전", "외곽 방어형 지속 타격", "strap"),
    ("안내방송 충격파", "주인공 중심 원형 파동", "주변 적 밀어내며 피해", "wave"),
    ("급행열차 돌진", "넓은 직선으로 열차가 통과", "화면을 가르는 강한 공격", "train"),
    ("환승 게이트", "적 많은 곳에 게이트 소환", "사람들이 지나가며 공격", "gate"),
]

cols = 3
card_w, card_h = 400, 500
gap_x, gap_y = 45, 46
start_x, start_y = 72, 220


def draw_player(cx, cy, s=1):
    d.ellipse((cx - 16 * s, cy - 20 * s, cx + 16 * s, cy + 16 * s), fill="#f4d1a1", outline="#fff3b0", width=max(1, int(2 * s)))
    d.rounded_rectangle((cx - 13 * s, cy + 10 * s, cx + 13 * s, cy + 48 * s), radius=int(8 * s), fill="#2a2f36", outline="#d6b06f", width=max(1, int(2 * s)))
    d.ellipse((cx - 8 * s, cy - 8 * s, cx - 4 * s, cy - 4 * s), fill="#101418")
    d.ellipse((cx + 4 * s, cy - 8 * s, cx + 8 * s, cy - 4 * s), fill="#101418")


def draw_enemy(cx, cy, color="#ef476f", s=1):
    d.ellipse((cx - 17 * s, cy - 17 * s, cx + 17 * s, cy + 17 * s), fill=color, outline="#ffe066", width=max(1, int(2 * s)))
    d.ellipse((cx - 7 * s, cy - 5 * s, cx - 3 * s, cy - 1 * s), fill="#101418")
    d.ellipse((cx + 3 * s, cy - 5 * s, cx + 7 * s, cy - 1 * s), fill="#101418")


def arrow(x1, y1, x2, y2, color, width=5):
    d.line((x1, y1, x2, y2), fill=color, width=width)
    ang = math.atan2(y2 - y1, x2 - x1)
    for a in (ang + 2.45, ang - 2.45):
        d.line((x2, y2, x2 + 22 * math.cos(a), y2 + 22 * math.sin(a)), fill=color, width=width)


def draw_icon(kind, x, y, w, h):
    cx, cy = x + w / 2, y + h / 2 + 8
    d.ellipse((cx - 86, cy - 86, cx + 86, cy + 86), outline="#1f4652", width=3)
    draw_player(cx, cy, 1.1)
    if kind == "orbit":
        for a in [0, 2.1, 4.2]:
            bx, by = cx + 92 * math.cos(a), cy + 92 * math.sin(a)
            d.polygon([(bx, by - 20), (bx + 13, by + 13), (bx, by + 25), (bx - 13, by + 13)], fill="#caffbf", outline="#31572c")
        d.arc((cx - 100, cy - 100, cx + 100, cy + 100), 20, 330, fill="#caffbf", width=5)
    elif kind == "lightning":
        for ex, ey in [(cx - 90, cy - 55), (cx + 85, cy - 25), (cx + 45, cy + 88)]:
            draw_enemy(ex, ey, "#ff477e", 0.95)
            d.line((ex - 8, ey - 70, ex + 12, ey - 25, ex - 4, ey - 25, ex + 8, ey + 18), fill="#9bf6ff", width=6)
    elif kind == "card":
        arrow(cx - 10, cy - 12, cx + 125, cy - 55, "#80ffdb", 5)
        d.rounded_rectangle((cx + 100, cy - 78, cx + 150, cy - 45), radius=8, fill="#ffe066", outline="#80ffdb", width=3)
        d.arc((cx - 30, cy - 95, cx + 150, cy + 50), 300, 75, fill="#80ffdb", width=4)
    elif kind == "bomb":
        d.ellipse((cx - 98, cy - 72, cx + 98, cy + 124), outline="#ff477e", width=6)
        for r in [24, 42, 60]:
            d.ellipse((cx - r, cy + 20 - r, cx + r, cy + 20 + r), outline="#ffd166", width=3)
        d.text((cx - 32, cy - 8), "민원", font=F_SMALL, fill="#fff3b0")
    elif kind == "laser":
        d.rectangle((x + 28, cy - 18, x + w - 28, cy + 18), fill="#80ffdb")
        d.rectangle((x + 28, cy - 7, x + w - 28, cy + 7), fill="#eaffff")
        for ex in [x + 62, x + w - 70]:
            draw_enemy(ex, cy + 60, "#ff477e", 0.85)
    elif kind == "strap":
        for a in [0, 1.26, 2.52, 3.78, 5.04]:
            bx, by = cx + 118 * math.cos(a), cy + 118 * math.sin(a)
            d.arc((bx - 18, by - 18, bx + 18, by + 18), 25, 335, fill="#ffd6a5", width=5)
        d.arc((cx - 126, cy - 126, cx + 126, cy + 126), 0, 360, fill="#ffd6a5", width=3)
    elif kind == "wave":
        for r, c in [(48, "#9bf6ff"), (88, "#80ffdb"), (128, "#fff3b0")]:
            d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=c, width=4)
        for ex, ey in [(cx - 135, cy - 10), (cx + 132, cy + 24)]:
            draw_enemy(ex, ey, "#ff477e", 0.85)
    elif kind == "train":
        d.rounded_rectangle((x + 34, cy - 58, x + w - 34, cy + 58), radius=24, fill="#263b48", outline="#80ffdb", width=5)
        d.rectangle((x + 84, cy - 38, x + w - 84, cy - 8), fill="#9bf6ff")
        arrow(x + 60, cy + 82, x + w - 58, cy + 82, "#ffd166", 5)
    elif kind == "gate":
        d.rounded_rectangle((cx - 82, cy - 84, cx + 82, cy + 84), radius=18, outline="#80ffdb", width=6)
        for i in range(5):
            px = cx - 96 + i * 48
            d.ellipse((px - 9, cy - 22, px + 9, cy - 4), fill="#f8f9fa")
            d.rounded_rectangle((px - 7, cy - 2, px + 7, cy + 35), radius=5, fill="#d6b06f")
        arrow(cx - 120, cy + 55, cx + 120, cy + 55, "#80ffdb", 4)


for idx, (name, line1, line2, kind) in enumerate(weapons):
    col, row = idx % cols, idx // cols
    x = start_x + col * (card_w + gap_x)
    y = start_y + row * (card_h + gap_y)
    d.rounded_rectangle((x, y, x + card_w, y + card_h), radius=18, fill="#111b22", outline="#28505c", width=3)
    d.text((x + 24, y + 22), f"{idx + 1}. {name}", font=F_CARD, fill="#fff3b0")
    d.text((x + 24, y + 68), line1, font=F_BODY, fill="#f8f9fa")
    d.text((x + 24, y + 100), line2, font=F_BODY, fill="#9bf6ff")
    draw_icon(kind, x + 18, y + 142, card_w - 36, 300)
    d.rounded_rectangle((x + 24, y + 452, x + card_w - 24, y + 480), radius=12, fill="#0b141a", outline="#1f4652")
    d.text((x + 42, y + 454), "레벨이 오르면 수량/범위/쿨타임/피해량 강화", font=F_SMALL, fill="#caffbf")

img.save(out)
print(out.resolve())
