# Lineups CS2

Guia rápido, em português, para consultar lineups de granadas nos sete mapas do pool competitivo de CS2 em setembro de 2026.

## Site ao vivo

https://deep-essence-hjmw.here.now/

Publicado no [here.now](https://here.now) a partir da pasta `dist/` (site estático permanente).

## Conteúdo

- 16 lineups (smoke, flash e molotov) em Mirage, Dust2, Inferno, Nuke, Ancient, Anubis e Cache;
- captura da posição, mira e resultado para cada lineup, com visualização ampliada na mesma página;
- busca, filtros por mapa e granada e favoritos salvos no navegador;
- link da fonte original em cada ficha.

As lineups foram pesquisadas no [CS2Nades](https://cs2nades.gg/); o crédito de cada captura aparece na ficha. Confira cada lançamento em uma partida de treino, pois atualizações do jogo podem alterar o resultado.

## Executar no computador

O projeto é um site estático, feito com HTML, CSS, JavaScript e JSON. Não precisa de instalação nem de etapa de build. É necessário usar um servidor local porque o navegador carrega `lineups.json` via `fetch`.

```powershell
git clone https://github.com/Thiagojm/cs2-lineups.git
cd cs2-lineups
python -m http.server 8000 --directory dist
```

Abra `http://localhost:8000`. Se o comando `python` não estiver disponível, use qualquer servidor local de arquivos estáticos apontado para `dist`.

## Estrutura e publicação

- `dist/index.html`: página inicial;
- `dist/styles.css`: estilos;
- `dist/app.js`: busca, filtros, favoritos e cartões;
- `dist/lineups.json`: conteúdo das fichas e links das fontes;
- `dist/images/`: capturas;
- `.openai/hosting.json`: configuração legada do Sites; não é o destino de publicação.

Publicação atual: here.now, slug `deep-essence-hjmw`, raiz `dist/`, sem comando de build. Commits no GitHub não republicam o site automaticamente; um novo publish da pasta `dist/` atualiza a URL acima.
