# Júlia & Mathias — 26.09.2026

"Você esteve aqui. Ajude-nos a lembrar."

Site digital de agradecimento aos convidados do casamento. Experiência
narrativa em página única, pensada para ser acessada via QR code nas mesas
da festa, convidando cada convidado a enviar as fotos e vídeos que
registrou durante a celebração — direto para o Cloudinary (armazenamento
privado, sem galeria pública).

O foco do site é gratidão e memória coletiva do dia, não a história do
relacionamento do casal.

## Como rodar localmente

1. Abra a pasta no VS Code (ou editor de sua preferência).
2. Instale a extensão **Live Server** (se ainda não tiver).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.
4. O site abrirá em algo como `http://127.0.0.1:5500`.

Não é necessário instalar dependências, Node, build step ou backend.

## Estrutura de arquivos

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   └── images/       ← fotos do pré-wedding, já otimizadas para web
└── README.md
```

## Estrutura da página

1. Abertura (hero) — nomes e data.
2. Agradecimento aos convidados.
3. "Você faz parte desta memória" — bloco de fotos editoriais e galeria.
4. Chamada para compartilhar — "Fotografe. Grave. Compartilhe."
5. Upload (Cloudinary).
6. Encerramento.

Um botão fixo ("📸 Enviar uma memória") acompanha a rolagem em telas de
celular, ficando disponível o tempo todo exceto no hero e na própria
seção de upload.

## Cloudinary (upload de memórias)

Os botões "📸 Enviar uma memória" (o da seção de upload e o fixo mobile)
abrem o mesmo Cloudinary Upload Widget, já configurado com:

- **Cloud name:** `mxsz1nso`
- **Upload preset (unsigned):** `casamento_julia_mathias`
- **Pasta:** `casamento-julia-mathias`

Nenhuma credencial sensível está no código — apenas o cloud name e o preset
unsigned, que são seguros para ficar no frontend.

Limites aplicados (definidos no widget e reforçados nas mensagens de erro):

- Até 5 arquivos por envio
- Fotos: até 10 MB
- Vídeos: até 50 MB
- Formatos: jpg, jpeg, png, webp, heic, mp4, mov

Os arquivos enviados **não** aparecem em nenhuma galeria pública do site —
eles ficam disponíveis apenas para administração dos noivos dentro do painel
do Cloudinary.

## Publicando

O site é 100% estático, então pode ser publicado diretamente em:

- **GitHub Pages:** suba os arquivos para um repositório e ative o Pages
  apontando para a branch principal.
- **Vercel:** importe o repositório (ou arraste a pasta no dashboard) — não
  é necessário configurar build command, é um projeto estático.

Depois de publicado, gere o QR code apontando para a URL final e inclua nos
cartões das mesas.

## Notas de manutenção

- As imagens em `assets/images/` já foram redimensionadas e comprimidas
  para carregamento rápido em 4G/5G de festa. Se for trocar alguma foto,
  mantenha a largura máxima em torno de 1600px e qualidade JPEG ~80–85%.
- O JavaScript não usa nenhuma biblioteca além do Cloudinary Widget —
  fácil de ler e ajustar mesmo sem experiência avançada em programação.
- O botão fixo mobile (`#stickyCta`) usa `IntersectionObserver` para
  aparecer/desaparecer conforme o scroll; em navegadores sem suporte, ele
  fica sempre visível.
- `prefers-reduced-motion` é respeitado: quem tiver essa preferência no
  sistema não verá as animações de entrada.
