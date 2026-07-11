# AgroSafra - Arquitetura MVP

## Objetivo

Construir um app Android leve, offline-first e reaproveitavel para futuros produtos da trilogia Agro. A tela nao deve conhecer detalhes de Firebase, P2P, billing ou armazenamento; ela chama casos de uso/modulos.

## Camadas

```text
UI / features
  Home, futuros fluxos de AgroCalc, AgroEstoque, AgroManual, AgroLog, Clima

Modules
  Regras de negocio puras, calculos, modelos e politicas de dominio

Core
  Storage local, Outbox, sincronizacao, cloud, P2P, monetizacao e tema
```

## Offline-first

- Dados operacionais ficam no aparelho.
- `outbox` ordena Avisos e Mensagens Prioritarias antes de mensagens normais.
- O coordenador de sync tenta Cloud e AgroSync Local por transportes intercambiaveis.
- A implementacao atual usa AsyncStorage no MVP, mas a API de storage permite evoluir para SQLite ou WatermelonDB.

## Firebase

Firestore deve guardar apenas dados compartilhados e recentes:

- `groups`
- `members`
- `notices`
- `chatMessages` dos ultimos 30 dias

Historicos de AgroCalc, estoque e diario ficam locais, com envio apenas quando forem relatorio ou mensagem sincronizavel.

## AgroSync Local

O contrato P2P fica em `src/core/p2p`:

- descoberta de peers por NSD, Wi-Fi Direct ou servidor WebSocket local;
- flush da Outbox pela intranet;
- botao visual "Sede Sync" na Home;
- sincronizacao automatica em background quando houver suporte nativo.

## Talk Pro Audio

- Audio recomendado: Opus ou AAC com baixo bitrate.
- Audio baixado recebe `expiresAt` de 48h.
- Audio marcado como `saved` nao entra na limpeza automatica.
- Audio expirado pode ser baixado novamente via cloud/local server quando disponivel.

## Monetizacao

- Plano Solo: anuncios no app do funcionario.
- Operacional: assinatura admin, grupo de ate 10 pessoas e relatorio PDF.
- Talk Pro: chat, audio inteligente e AgroSync Local.
- Micro-upgrades: grupo extra, +10 funcionarios e remocao individual de anuncios.

## Proximas implementacoes recomendadas

1. Navegacao entre modulos com React Navigation.
2. Storage local real com SQLite para historicos grandes.
3. Firebase Auth e regras de seguranca por grupo/papel.
4. Implementacao nativa do AgroSync Local para Android.
5. Google Play Billing e AdMob por build nativo/EAS.
6. Testes de dominio para calculadoras, estoque, outbox e expiracao de audio.