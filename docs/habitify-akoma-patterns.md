# Habitify × padrões Akoma — análise a partir do código

Baseline: `@rafael_dias/akoma@0.8.4`. Fonte de verdade: o repo Habitify, cruzado com `node_modules/@rafael_dias/akoma/{README.md,content/*,src/styles}`.

Análise apenas — sem implementação. Padrões devem permanecer **accent-agnostic**.

---

## Validação do termo “editorial”

**Sim, a definição descreve o Habitify** — com dois ajustes importantes.

O app faz hierarquia por tipografia (`.page-label` + `.page-title`), fundo plano (`--bg`), listas (`AkList`/`AkListRow`) em vez de grids de cards, e accent reservado a ações/marca. O próprio CSS nomeia isso:

```css
/* Editorial day header — app/assets/css/app.css */
.day-header {
  padding:
    calc(var(--page-pad-top) + var(--safe-top))
    var(--page-pad-x)
    var(--space-4);
  background: var(--bg);
}
```

### O que ajustar no vocabulário

1. **Colisão de nome.** No Akoma, “editorial” já significa a fonte Lora (`--font-editorial` em `tokens.css` / `content/decisions.md`). Habitify quase não usa Lora no UI operacional — o tom “revista” vem de **display tipográfico + respiro**, não do serif. Sugestão: chamar o tom de **`page tone` / `editorial layout`**, e reservar **`editorial type`** para Lora.
2. **Eyebrow ≠ só `.page-label`.** Na home/settings/history o label é `.page-label` (accent, 13px bold). No bloco de consistência o Habitify inventa um *segundo* eyebrow (`.history-overview__eyebrow`) — mesma intenção, API diferente. Formalize um único padrão: **page chrome** (label+title+meta) vs **section chrome** (`AkSectionHeader`).
3. **“Sem cards” é regra forte no Habitify.** `AkCard` existe no pacote e **não é usado** nas telas principais. Listas + divisores + chips. Documentar isso como preferência do mood `app` em PWAs pessoais evita o erro Material de embrulhar tudo.

### Stack tipográfico no Habitify

| Camada | Papel | Exemplo |
|--------|-------|---------|
| Eyebrow / label | Contexto pequeno acima do título | “Sua rotina”, “Sua evolução” (`.page-label`) |
| Título hero | Foco principal da tela | “Hoje”, “Progresso” (`.page-title`) |
| Meta / subtítulo | Informação secundária | data por extenso (`--text-secondary`) |
| Corpo | Conteúdo operacional | listas de hábitos, calendário |

---

## 1. Inventário de padrões implícitos

### Shell locked (`AppShell`)

| | |
|--|--|
| **Onde** | `app/layouts/default.vue`, `app/assets/css/app.css` (`.app-root`, `.app-main`, `.app-scroll`, `.page-body`) |
| **Regra** | Sempre `100dvh` + `overflow: hidden` no root; scroll só num filho; nunca a página inteira rolando com a tab bar. |
| **Por quê** | PWA “app-like”: tab bar fixa, safe areas, FAB sem scrollar junto. |

Akoma já tem `.akoma-shell` e `--shell-max` em `base.css`/`tokens.css`, mas **não documenta** o contrato `dvh` + scroll interno. Habitify reinventou o shell em vez de estender `.akoma-shell`.

### Page chrome (`PageHeader`)

| | |
|--|--|
| **Onde** | Classes Akoma `.page-label` / `.page-title` (`akoma/.../base.css`); wrappers locais `.day-header`, `.page-header-simple`, header de `app/pages/history.vue` |
| **Regra** | Sempre label (accent) → título display → meta secundária (`--text-secondary`); ações no canto com `AkIconButton`, não no título. |
| **Por quê** | Tom editorial: a tela se anuncia pela tipografia, não por um card-hero. |

**Inconsistência interna:** três wrappers CSS para a mesma anatomia. Dev novo copia um e quebra o outro.

### FAB (`FloatingPrimary`)

| | |
|--|--|
| **Onde** | `.fab` + `.page-body--with-fab` em `app.css`; uso em `app/pages/index.vue` (`AkButton` + `AppIcon`) |
| **Regra** | Sempre acima da tab bar (`safe-bottom + nav-height`); body com padding extra; nunca dentro do scroll. |
| **Por quê** | Ação primária do dia (criar hábito) sem competir com o conteúdo. |

Não existe no Akoma.

### Bottom sheet (`Sheet`)

| | |
|--|--|
| **Onde** | `app/components/AppBottomSheet.vue` (+ HabitDetail, Note, forms, confirm delete) |
| **Regra** | Sempre sheet inferior com handle + swipe-down; nunca modal centrado em fluxos mobile; superfície `--bg-elevated` + `--shadow-md` (elevação rara e justificada). |
| **Por quê** | Edição/detalhe sem sair do contexto da lista. |

Não existe no Akoma. Confirmação de exclusão também é sheet + `AkButton variant="danger"` — não há `AkConfirm`.

### Toast + haptic

| | |
|--|--|
| **Onde** | `app/composables/useAppToast.ts`, `app/components/AppToastHost.vue`; haptic em `app/components/HabitCard.vue` (`navigator.vibrate`) |
| **Regra** | Toast acima da tab bar; variantes via `AkBadge`; haptic só no momento de completar (feedback tátil do “check”). |
| **Por quê** | Feedback sem bloquear; vibração reforça o gesto principal do produto. |

Akoma exporta classes de motion (ex. toast-pop) mas **não** a API de toast.

### Tab bar

| | |
|--|--|
| **Onde** | `app/components/AppBottomNav.vue` → `AkTabBar` / `AkTabBarItem` |
| **Regra** | Uma tab bar global no layout autenticado; ícones Cuida; `v-model` = rota. |
| **Por quê** | Navegação primária do mood app. |

**Gap de docs:** componentes existem no pacote, mas **faltam da tabela do README** (ainda lista “Components v0.6”).

### Intensidade / shades de completude (`CompletionScale`)

| | |
|--|--|
| **Onde** | `app/utils/completionShade.ts`, `.completion-shade--*` em `app.css`, `HistoryCalendar.vue`, `HistoryDayBlock.vue` |
| **Regra** | Taxa 0–1 → 5 steps cromáticos do **accent do app** (nunca `--cat-*`); mais feito = mais escuro. |
| **Por quê** | Heatmap legível e accent-agnostic: muda a paleta, a escala continua fazendo sentido. |

As 5 shades **estão** documentadas em `content/colors.md`. O **mapeamento taxa→shade** e as utility classes são invenção do Habitify.

### Overview de progresso (domínio + layout)

| | |
|--|--|
| **Onde** | `.history-overview` em `app/pages/history.vue` |
| **Regra** | Um número hero de consistência + tendência + `AkProgress`; chips de período acima; seções com `AkSectionHeader`. |
| **Por quê** | Progresso editorial: um foco tipográfico, não dashboard de KPIs. |

Composição de domínio — não deve virar componente genérico “AkStats”.

### Accent de marca vs cor de item

| | |
|--|--|
| **Onde** | Marca: `data-accent="evergreen"` + `applyAccentPalette` (`app/app.vue`, `useAppTheme.ts`). Item: `--cat-1…6` via `app/utils/colors.ts` |
| **Regra** | Accent = chrome do sistema (labels, checks, heatmap, tabs). `--cat-*` = identidade do hábito (wash do emoji). Nunca pintar o heatmap com cor do hábito. |
| **Por quê** | Separar “marca do app” de “entidade na lista”. |

`content/implementation.md` já menciona `--cat-*`; Habitify é a prova de uso.

### Ícones (estratégia dual)

| | |
|--|--|
| **Onde** | `app/components/AppIcon.vue` (Iconify/`lucide:*`) em quase tudo; Cuida só na tab bar |
| **Regra** | De fato: Cuida onde o Akoma exige (`AkTabBarItem`); Lucide no resto. |
| **Por quê** | Pragmatismo pós-migração — **não** é uma regra limpa de DS. |

Isso é inconsistência a documentar como dívida, não como padrão.

### Gestos

| | |
|--|--|
| **Onde** | Swipe de dia (`app/pages/index.vue`), swipe de mês (`HistoryCalendar.vue`), dismiss de sheet |
| **Regra** | Swipe horizontal só quando `dx` supera limiar e (no calendário) supera `dy`; respeitar `prefers-reduced-motion`. |
| **Por quê** | Navegação temporal sem botões extras; não sequestrar o scroll vertical. |

### PWA / `theme-color`

| | |
|--|--|
| **Onde** | `app/app.vue` meta, `useAppTheme.ts` (`THEME_COLORS` hex), `nuxt.config.ts` manifest |
| **Regra** | Atualizar `theme-color` no toggle light/dark. |
| **Por quê** | Status bar do SO alinhar ao `--bg`. |

**Fragilidade:** hex hardcoded (`#f8f6f1` / `#1d211f`), não lidos dos tokens; manifest PWA fica preso no light. Não é accent-agnostic de verdade no chrome do SO.

### Animações

| Padrão | Onde | Mecânica |
|--------|------|----------|
| Day swipe | `app/pages/index.vue` | touch dx>50 → prev/next; `Transition` `slide-left/right` |
| Calendar swipe | `HistoryCalendar.vue` | dx>56 e dx > dy×1.25 |
| Sheet dismiss | `AppBottomSheet.vue` | swipe down no handle (>60px) |
| Reduced motion | `app.css` | desliga transitions |

---

## 2. “Editorial” no Habitify — validação

### Segue bem

- Stack label → title → meta em home, settings, history, login
- Listas flat; sem `AkCard` nas telas centrais
- Accent no `.page-label`, progress, checks, shades — não em fundos de seção
- `AkAmbientBg contained` como atmosfera, não como decoração barulhenta
- Filosofia Akoma (“Rhythm over decoration”, “Flat before float”) refletida na prática

### Quebra / tensiona

- Bloco Consistência é um **quase-card** (superfície agrupada) — ainda editorial, mas mais “widget” que o resto
- Sheet e toast usam `--shadow-md` (ok: elevação rara; documentar *quando* permitir)
- Streak com emoji 🔥 — ruído visual fora do sistema tipográfico
- Header da home sobrescreve o clamp do `.page-title` (32–40px vs 34–46px do Akoma)

### Classes/tokens centrais do tom

`.page-label`, `.page-title`, `--font-display`, `--bg` / `--bg-soft` / `--bg-muted`, `--text-secondary`, `--space-*`, `--page-pad-*`, `AkList`/`AkListRow`, `AkSectionHeader`, `AkChip`, `AkProgress`, `AkAmbientBg`, `data-mood="app"`

### O que um dev novo erraria lendo só o Akoma

1. Usar o **violet default** do mood app (Habitify escolhe accent de produto)
2. Embrulhar a home em **`AkCard`** porque o componente existe
3. Usar **`.akoma-shell`** sem o contrato de scroll/`100dvh` (ou inventar outro shell inconsistente — como o Habitify fez)
4. Tratar shades só como “cores de botão”, não como **escala de intensidade**
5. Misturar `--cat-*` no chrome (tabs, labels, heatmap)
6. Assumir que `AkTabBar` não existe (sumiu do README)
7. Modal centrado desktop-style em vez de sheet
8. Confundir `--font-editorial` (Lora) com o layout editorial

---

## 3. Tiers: docs vs código no Akoma

### Tier A — só documentação

- Definição de **page tone** (editorial layout) vs **editorial type** (Lora)
- Anatomia **Page chrome**: label / title / meta / actions
- Contrato **App shell**: `100dvh`, scroll interno, safe areas, tab bar
- Regra **accent vs category colors**
- Preferência **lista > card** no mood `app` para PWAs pessoais
- Quando usar elevação (`--shadow-md`): sheet, toast, nada mais por padrão
- Documentar `AkTabBar` no README (já é código)
- Gestos: limiares e reduced-motion
- Anti-patterns (seção 5)

### Tier B — CSS utilities / tokens

| API sugerida | Signature mínima | Fica no app |
|--------------|------------------|-------------|
| `.ak-page-chrome` (ou documentar composição de `.page-label`+`.page-title`) | opcional `data-size="day\|simple"` | Textos de domínio |
| `.ak-fab-anchor` + `--fab-offset` | CSS only: bottom = nav+safe | Quando mostrar FAB |
| `.ak-completion-shade--{none\|lighter\|…}` | classes + talvez `--completion-rate` | Função que calcula a taxa |
| Tokens `--theme-color-light/dark` derivados de `--bg` | para PWA meta | Persistência do theme |

**Breaking?** Só se renomear classes existentes de app que alguém copiou. Preferir *additive* no 0.8.x.

### Tier C — componentes Vue

| API | Props mínimas | Domínio no app |
|-----|---------------|----------------|
| `AkSheet` | `open`, `title?`, `v-model:open` | Conteúdo do form/detalhe |
| `AkFab` | default slot (ícone/label), posicionamento via CSS do shell | `onClick` / permissão de exibir |
| `AkPageHeader` | slots: `label`, `title`, `meta`, `actions` | Copy e ações |
| `AkToastHost` + provider | — | Mensagens de negócio |

**Não** promover: `HistoryCalendar`, `HabitCard`, overview de consistência, heatmap de hábito — são produto.

### Tier D — composables

| API | Signature | Domínio no app |
|-----|-----------|----------------|
| `useAkomaTheme({ mood, accent, storageKey? })` | setMode, toggle, aplica `data-*` + accent + theme-color | Accent escolhido pelo produto |
| `useAkomaToast()` | `show({ message, variant })` | Textos |
| `completionShade(rate)` (util) | rate → shade id / class | De onde vem a taxa |

`useConfirm` só se padronizar sheet de confirmação; senão documentar o padrão “sheet + danger button”.

---

## 4. Checklist — novo PWA irmão (PR review)

1. `data-mood="app"` + `data-accent` explícito (não depender do violet default sem decisão)
2. Shell: root `100dvh` / overflow hidden; um único scroll container
3. Padding inferior ≥ `nav-height + safe-bottom` (+ FAB se houver)
4. Toda tela autenticada: page chrome = label → title → meta
5. Listas com `AkList`/`AkListRow`; `AkCard` só se houver interação que *precise* de superfície
6. Accent só no chrome do sistema; entidades usam `--cat-*` ou neutro
7. Intensidade/heatmap usa as 5 shades do accent, não hex solto
8. Overlay mobile = sheet inferior (não modal centrado)
9. Toast acima da tab bar; sem alert nativo para feedback rotineiro
10. Tab bar via `AkTabBar`; ícones Cuida na bar
11. `theme-color` acompanha light/dark (idealmente derivado de `--bg`)
12. Tokens Akoma para cor/espaço; zero hex de UI “de marca” fora de theme-color/PWA se evitável
13. Motion com propósito + `prefers-reduced-motion`
14. `AkAmbientBg` contido no shell, não full-bleed decorativo competindo com o título
15. Sem reimplementar botões/inputs/chips — usar `Ak*`

---

## 5. Anti-patterns

| Não faça | Por quê | Onde o Habitify ensina o contrário |
|----------|---------|-------------------------------------|
| Grid de `AkCard` com sombra na home | Vira Material/dashboard | Home = `AkList` + header tipográfico |
| Remapear `--accent: var(--accent-light)` globalmente | Quebra a escala de 5 shades | Já foi feito e **revertido**; shades precisam da escala intacta |
| Pintar células do calendário com `--cat-*` | Confunde marca × item | `completionShade` → só `--accent-*` |
| Modal centrado para editar hábito | Estranho no polegar | `AppBottomSheet` |
| FAB dentro de `.app-scroll` | Some no scroll | `.fab` fixed + `.page-body--with-fab` |
| Deixar a `window` scrollar com tab bar `position:fixed` | Conteúdo sob a bar / bounce estranho | `.app-root` trava o viewport |
| Usar Lora em todo H1 achando que é “editorial” | Colisão com `--font-editorial` | Habitify usa `--font-display` (DM) no `.page-title` |
| Copiar `THEME_COLORS` hex do Habitify em app `slate`/`violet` | Status bar desalinhada | Precisa tokenizar |
| Dois sistemas de ícone sem regra | Dívida do Habitify | Não celebrar; escolher Cuida-first ou documentar exceção TabBar |
| Duplicar UI de linha (HabitCard vs HistoryDayBlock) | Drift visual | Um row pattern no app (ou no DS só se for genérico) |

---

## Manifesto (mood `app`)

Apps Akoma mood `app` devem parecer **páginas calmas de rotina**, não painéis. A primeira coisa que se lê é um título grande; o resto é lista respirada. Cor de marca aparece em gestos e ênfase — não em caixas. Superfícies quase não flutuam; quando sobem (sheet, toast), é porque o polegar precisa de um plano temporário. Accent é escolha de produto; a anatomia permanece. Intensidade (progresso, streaks visuais, heatmaps) caminha na escala cromática do accent, para qualquer paleta parecer nativa. O shell é um telefone: altura travada, navegação embaixo, conteúdo no meio.

---

## Glossário proposto

| Termo | Definição |
|-------|-----------|
| **Page tone** (ex-“editorial” layout) | Hierarquia por tipografia e respiro, não por cards/elevação |
| **Editorial type** | Uso opcional de `--font-editorial` (Lora) |
| **Page chrome** | Label + title + meta + actions do topo da tela |
| **App shell** | Viewport `dvh`, scroll interno, tab bar, safe areas |
| **System accent** | Paleta `data-accent` / `--accent-*` do produto |
| **Category color** | `--cat-*` para entidades na lista |
| **Completion scale** | Mapeamento discreto de taxa → 5 shades do accent |
| **Floating primary** | FAB ancorado acima da tab bar |
| **Sheet** | Overlay inferior com handle; padrão mobile de detalhe/form |
| **Contained ambient** | `AkAmbientBg` limitado ao shell |

---

## Prioridades

### Documentar primeiro (top 5)

1. Page tone + anatomia page chrome
2. App shell (dvh / scroll / nav / FAB offset)
3. Accent vs `--cat-*`
4. Completion scale (como *usar* as 5 shades)
5. Atualizar README: `AkTabBar` + preferência lista>card no mood app

### Codificar primeiro (top 5)

1. `AkSheet` (desbloqueia todos os PWAs)
2. Utilities `.ak-completion-shade--*` (+ helper TS)
3. `useAkomaTheme` (mood/accent/theme-color)
4. `AkPageHeader` (mata os 3 wrappers do Habitify)
5. `AkFab` + tokens de offset — ou só CSS bem documentado se quiser adiar componente

---

## Nota de honestidade sobre o repo

O Habitify é uma **boa referência de intenção**, não um spec limpo: shell paralelo ao `.akoma-shell`, três headers, ícones dual, `theme-color` em hex, e `HistoryDayBlock` ≠ `HabitCard`. Ao formalizar no Akoma, extraia as regras — não congele os nomes locais (`.day-header`, `.fab`, `AppBottomSheet`).

---

## Mapa rápido: Akoma documenta vs Habitify inventa

| Camada | Akoma | Habitify por cima |
|--------|-------|-------------------|
| Tipografia de página | `.page-label`, `.page-title` | Usa nas páginas |
| Listas / chips / headers / progress / badge / empty | Componentes documentados | Composição das telas |
| Accent 5 steps + soft/contrast | Documentado | Mapeia taxa → heatmap |
| Mood App + paleta | Documentado | `evergreen` no root |
| Cores de domínio `--cat-*` | Mencionado no checklist | `colors.ts` + emojis |
| Shell max-width / nav height | Tokens CSS | `.app-root` espelha `--shell-max` |
| FAB, bottom sheet, calendário heatmap, HabitCard, overview Consistência | **Não** | App-owned |

**Em uma frase:** Akoma fornece linguagem visual (tokens, moods, listas, chips, tipografia de página, 5 shades); Habitify inventa o produto de progresso e os primitivos de app mobile (escala de completude, calendário, FAB/sheet, card de hábito) e usa `--cat-*` separado do accent da marca.
