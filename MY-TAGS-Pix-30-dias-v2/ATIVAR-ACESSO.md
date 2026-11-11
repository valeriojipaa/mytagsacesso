# MY TAGS — Pix com liberação manual

Valor: R$ 39,99 por 30 dias. Pix: crioumarketing@gmail.com.
Recebedor: Valerio Alves dos Santos. WhatsApp: (48) 98811-6400.

## 1. Preparar o Supabase

Abra https://supabase.com/dashboard/project/soeszztfgqabzkapkkdj/sql/new
Copie o conteúdo de supabase/configurar.sql, cole no SQL Editor e clique em Run.
Em Authentication → URL Configuration, configure Site URL como https://my-tags-br.vercel.app e permita os redirecionamentos https://my-tags-br.vercel.app/ e https://my-tags-br.vercel.app/?recuperar=1.
Mantenha o provedor Email habilitado e a confirmação de e-mail ativa.
Configure SMTP próprio para enviar e-mails a clientes externos. O envio padrão do Supabase tem restrições e não deve ser presumido pronto para vendas.

## 2. Publicar na Vercel

Use a pasta MY-TAGS-Vercel-Corrigido como Root Directory do projeto existente.
Framework: Other. Build Command: node build.cjs. Output Directory: public.
Remova overrides antigos que deixem Build Command vazio ou Output Directory como ponto.
O app.html fica fora da pasta pública e é entregue pela função api/app.js depois de validar o acesso no Supabase. Não publique o arquivo app.html por upload estático nem copie o ZIP antigo para public.
Não altere o domínio: dados anteriores do aplicativo ficam no navegador daquele endereço.

## 3. Liberar uma compra

O cliente cria a conta e confirma o e-mail. Ele entra, paga e envia o comprovante pelo WhatsApp.
Confira o recebimento no seu próprio banco.
Abra supabase/liberar-cliente.sql, troque EMAIL_DO_CLIENTE pelo e-mail cadastrado e execute no SQL Editor.
Execute apenas uma vez por pagamento. O resultado mostra usuário e vencimento; sem resultado, confira se o cliente confirmou o e-mail.
Peça ao cliente para clicar em Verificar minha liberação. Não precisa compartilhar sua senha com você.
Uma renovação acrescenta 30 dias ao saldo válido, ou começa agora se já venceu.
Para revogar, altere expires_at para uma data passada no Table Editor de access_grants.

## 4. Conferir antes de vender

Faça um cadastro de teste com um e-mail seu, confirme o e-mail e entre. Sem liberação, deve aparecer o Pix.
Libere esse e-mail pelo SQL e confira se abre o aplicativo. Teste recuperação de senha.
Em janela anônima, /app, /app.html e /api/app não devem abrir o aplicativo.
Confira um acesso vencido e outro usuário sem liberação. Ambos devem ficar sem acesso.

## Limites desta versão

Os dados de produtos, estoque e vendas continuam locais ao navegador; esta entrega não cria sincronização nem backup na nuvem. Cada conta passa a usar uma área local própria. Dados antigos da demonstração não são importados automaticamente.
O bloqueio impede novas aberturas sem liberação. Uma página já carregada pode continuar funcionando até fechar ou atualizar; o aplicativo funciona no navegador e não implementa revogação de uma cópia já entregue.
O repositório original é público: o código do aplicativo continua público. Login controla o serviço publicado, não protege a propriedade do código.
Testes locais da verificação passaram; integração real com Supabase, e-mails e publicação ainda precisa ser validada após a configuração.
