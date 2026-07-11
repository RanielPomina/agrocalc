# Android preview APK

## Gerar APK para teste

```powershell
npm install
npm run typecheck
npx expo install --check
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

O perfil `preview` gera um APK instalavel fora da Play Store. Ao terminar, o EAS mostra um link para baixar o arquivo `.apk`.

## Hospedar no Supabase Storage

O Supabase nao compila app Android. Use ele como hospedagem do APK pronto:

1. Abra o projeto no Supabase.
2. Va em `Storage`.
3. Crie um bucket chamado `releases`.
4. Envie o APK gerado pelo EAS.
5. Gere uma public URL ou signed URL para compartilhar no Android.

Sugestao de caminho do arquivo:

```text
releases/agrosafra-preview-0.1.0.apk
```

## Instalar no Android

1. Abra o link do APK no celular.
2. Permita instalacao de apps desconhecidos para o navegador/gerenciador de arquivos.
3. Instale o APK.

Para publicacao oficial depois do MVP, use o perfil `production`, que gera `.aab` para Google Play.