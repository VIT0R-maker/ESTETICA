# Orient — Landing Page

Landing page de produto de página única para o relógio Orient. HTML, CSS e
JavaScript puros: sem build, sem dependências, sem framework. É só abrir e
funciona.

O objetivo do projeto é mostrar como efeitos de scroll cinematográficos
(vídeo controlado pelo scroll, zoom de imagem, seções pinned) são construídos
sem biblioteca de animação nenhuma — só `requestAnimationFrame` e custom
properties do CSS.

---

## Como rodar

Os vídeos não carregam se você abrir o `index.html` direto pelo `file://` —
o navegador bloqueia. Suba um servidor local:

```bash
# Python (já vem instalado no macOS e na maioria dos Linux)
python3 -m http.server 8000
```

Depois abra <http://localhost:8000>.

Alternativas equivalentes, se preferir:

```bash
npx serve .          # Node
php -S localhost:8000
```

No VS Code, a extensão **Live Server** também resolve (botão "Go Live").

---

## Estrutura

```
.
├── index.html                    Página completa — todo o markup vive aqui
├── assets/
│   ├── css/style.css             Todo o CSS, incluindo os design tokens
│   ├── js/
│   │   ├── hero-video-scrub.js   Vídeo do topo controlado pelo scroll
│   │   ├── caixa-reveal.js       Vídeo da caixa abrindo, também por scroll
│   │   └── case-zoom.js          Zoom da foto da caixa até cobrir a tela
│   ├── images/
│   └── videos/
└── design-system/
    └── index.html                Pattern library — tokens e componentes
```

Cada arquivo em `assets/js/` é independente: contém um efeito, roda dentro de
uma IIFE e sai de cena sozinho se a seção correspondente não existir no HTML.
Eles são carregados na mesma ordem em que os efeitos aparecem na página.

---

## Design system

Abra `design-system/index.html` (pelo mesmo servidor local:
<http://localhost:8000/design-system/>).

Essa página **importa o mesmo `assets/css/style.css` da landing**. Não há CSS
duplicado: o que você vê documentado ali é literalmente o que a página de
produto usa. Mudou o token, mudou nos dois lugares.

### Paleta

São 8 cores, e nada além disso. Estão definidas como custom properties no topo
de [`assets/css/style.css`](assets/css/style.css):

| Token             | Hex       | Uso                          |
| ----------------- | --------- | ---------------------------- |
| `--dial-white`    | `#F7F5F1` | Fundo das seções claras      |
| `--numeral-black` | `#1C1C1C` | Texto em fundo claro         |
| `--orient-red`    | `#D93A2B` | Acento e CTA                 |
| `--red-hover`     | `#B03426` | Hover do vermelho            |
| `--steel-light`   | `#C8C6C2` | Bordas e divisores           |
| `--steel-dark`    | `#6E6C68` | Texto secundário no claro    |
| `--strap-black`   | `#161616` | Superfícies dark             |
| `--backdrop`      | `#0A0805` | Camada translúcida da nav    |

Acima delas existe uma camada semântica (`--text-primary`, `--bg-dark`,
`--accent-red`…) que só aponta para as 8 cores acima. **Use sempre a camada
semântica no CSS de componente** — assim uma troca de paleta acontece em um
lugar só.

### Tipografia

- **Newsreader** (serif variável) para display e headlines. O eixo `opsz`
  acompanha o `font-size` automaticamente via `font-optical-sizing: auto`.
- **Inter** para corpo de texto e interface.

Ambas vêm do Google Fonts — é a única requisição externa da página.

---

## Como os efeitos de scroll funcionam

Os três seguem o mesmo padrão, e vale entender ele uma vez:

1. Uma seção alta (o *track*) contém um filho `position: sticky` (o *pin*).
   Enquanto o track passa pela tela, o pin fica parado.
2. No `scroll`, calcula-se um `progress` de 0 a 1 — quanto do track já passou.
3. Esse progresso vira ou o `currentTime` de um vídeo, ou uma custom property
   que o CSS usa para transformar os elementos.
4. Tudo é agendado com `requestAnimationFrame` e protegido contra chamadas
   duplicadas, para não recalcular mais de uma vez por frame.

`caixa-reveal.js` e `case-zoom.js` se desligam quando o sistema pede
`prefers-reduced-motion: reduce`. A página continua legível e completa — só
sem a animação.

---

## Editando

- **Texto e seções** → `index.html`. Cada seção é delimitada por um comentário
  `<!-- ============ NOME ============ -->`.
- **Estilo** → `assets/css/style.css`, organizado nas mesmas seções, na mesma
  ordem do HTML.
- **Animações** → o arquivo correspondente em `assets/js/`.

Ao trocar uma imagem, mantenha os atributos `width` e `height` no `<img>`
batendo com as dimensões reais do arquivo. É o que impede o layout de pular
enquanto a imagem carrega.
# TESTE
# ESTETICA
