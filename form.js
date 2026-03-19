
    const form       = document.getElementById('referralForm');
    const successMsg = document.getElementById('success-message');
    const errorMsg   = document.getElementById('error-message');
    const widget     = document.getElementById('mexem-referral-widget');
    const submitBtn  = document.getElementById('submit-btn');
    const loader     = document.getElementById('form-loader');

    let isLoading = false;

    // Показывает лоадер и блокирует все элементы формы,
    // либо восстанавливает исходное состояние
    function setLoading(active) {
        isLoading = active;
        submitBtn.style.display = active ? 'none' : '';
        loader.style.display    = active ? 'flex' : 'none';
        form.querySelectorAll('input, button').forEach(el => {
            el.disabled = active;
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Останавливаем стандартную перезагрузку страницы

        // Защита от повторного вызова во время ожидания ответа
        if (isLoading) return;

        // 1. Проверяем чекбоксы
        const checkboxes = document.querySelectorAll('.terms-check');
        // Превращаем NodeList в массив и проверяем, что все отмечены
        const allChecked = Array.from(checkboxes).every(c => c.checked);

        if (!allChecked) {
            alert("Please agree to all terms before continuing.");
            return;
        }

        // 2. Получаем данные из полей формы
        const formData = new FormData(form);
        const emailValue = formData.get('email');           // Берет из input name="email"
        const ibAccountIdValue = formData.get('ib_account_id'); // Берет из input name="ib_account_id"

        // 3. Формируем красивый URL с параметрами
        const params = new URLSearchParams({
            email: emailValue,
            ib_account_id: ibAccountIdValue
        });

        setLoading(true);

      try {
          const response = await fetch(`https://fbf.mexem.workers.dev/?${params.toString()}`, {
              method: 'GET',
              mode: 'cors'
          });

          if (response.status === 429) {
              // Логика для Too Many Requests
              form.style.display = 'none';
              errorMsg.style.display = 'block';
              return;
          }

          if (response.ok) { // response.ok — это true для статусов 200-299
              const body = await response.json();

              if (body.msg === 'account has been found.') {
                  // Показываем виджет с персональными данными
                  form.style.display = 'none';
                  initReferralWidget(body.data);
              } else {
                  // Любой другой успешный ответ — стандартное сообщение
                  form.style.display = 'none';
                  successMsg.style.display = 'block';
              }
          } else {
              // Если статус не 200 и не 429 (например, 500)
              console.error('Server error:', response.status);
              form.style.display = 'none';
              successMsg.style.display = 'block';
          }

      } catch (error) {
          console.error('Network error:', error);
          // Ошибка сети (интернет пропал или CORS)
          form.style.display = 'none';
          successMsg.style.display = 'block';
      } finally {
          // Сбрасываем флаг (UI скрыт, но флаг нужно обнулить на случай
          // если в будущем форма будет восстанавливаться без перезагрузки)
          isLoading = false;
      }
    });

    // ─────────────────────────────────────────────────────────────────
    // initReferralWidget(data)
    // Вызывается после успешного API-ответа с msg "account has been found."
    // data: { Client_Portal_Url, Preferred_language, Friends_status_update }
    // ─────────────────────────────────────────────────────────────────
    function initReferralWidget(data) {
      var CLIENT_PORTAL_URL  = data.Client_Portal_Url      || '';
      var FRIENDS_STATUS_URL = data.Friends_status_update  || '';
      var LANG               = data.Preferred_language     || 'EN';

      var i18n = {
        EN: {
          badge:        'Refer a Friend',
          heroTitle:    'Invite Friends &amp;<br><span>Earn up to \u20ac150</span>',
          heroSub:      'Share MEXEM and get rewarded \u2014 it\u2019s that simple.',
          greeting:     'Dear',
          intro:        'As a MEXEM client, you can always benefit from our <strong>Refer a Friend</strong> programme. It is a great opportunity to share the advantages of MEXEM with friends and family and get rewarded for it.',
          sectionTitle: 'How the Enhanced Programme Works',
          step1Title:   'Invite Your Friends',
          step1Desc:    'Share your personal link via WhatsApp, Telegram, or copy and send it directly.',
          step2Title:   'Earn More',
          step2Desc:    'For every friend who registers through your invitation, you will receive <span class="mxr-pill">up to \u20ac150</span> directly into your trading account.',
          step3Title:   'Your Friends Win Too',
          step3Desc:    'Every referred friend receives <span class="mxr-pill gold">up to \u20ac50</span> to start their MEXEM experience.',
          step4Title:   'Track Your Success',
          step4Desc:    'Check the status of your referrals at any time.',
          signoff:      'Happy investing,<br><strong>The MEXEM Team</strong>',
          btnShare:     'Share Your Link',
          btnTrack:     'Track Referrals',
          copied:       '\u2713 Link Copied!',
          linkLabel:    'Your referral link',
        },
        IT: {
          badge:        'Invita un Amico',
          heroTitle:    'Invita Amici &amp;<br><span>Guadagna fino a \u20ac150</span>',
          heroSub:      'Condividi MEXEM e ricevi premi \u2014 \u00e8 semplicissimo.',
          greeting:     'Gentile',
          intro:        'Come cliente MEXEM, puoi sempre beneficiare del nostro programma <strong>Invita un Amico</strong>. \u00c8 una grande opportunit\u00e0 per condividere i vantaggi di MEXEM con amici e familiari e ricevere ricompense per farlo.',
          sectionTitle: 'Come Funziona il Programma',
          step1Title:   'Invita i Tuoi Amici',
          step1Desc:    'Condividi il tuo link personale tramite WhatsApp, Telegram, oppure copia e invia il link direttamente.',
          step2Title:   'Guadagna di Pi\u00f9',
          step2Desc:    'Per ogni amico che si registra tramite il tuo invito, riceverai <span class="mxr-pill">fino a \u20ac150</span> direttamente nel tuo conto di trading.',
          step3Title:   'Anche i Tuoi Amici Vincono',
          step3Desc:    'Ogni amico invitato riceve <span class="mxr-pill gold">fino a \u20ac50</span> per iniziare la propria esperienza MEXEM.',
          step4Title:   'Monitora il Tuo Successo',
          step4Desc:    'Controlla lo stato dei tuoi referral in qualsiasi momento.',
          signoff:      'Buon investimento,<br><strong>Il Team MEXEM</strong>',
          btnShare:     'Condividi il Tuo Link',
          btnTrack:     'Monitora i Referral',
          copied:       '\u2713 Link Copiato!',
          linkLabel:    'Il tuo link referral',
        },
        NL: {
          badge:        'Verwijs een Vriend',
          heroTitle:    'Nodig Vrienden Uit &amp;<br><span>Verdien tot \u20ac150</span>',
          heroSub:      'Deel MEXEM en word beloond \u2014 zo eenvoudig is het.',
          greeting:     'Beste',
          intro:        'Als MEXEM-klant kunt u altijd profiteren van ons <strong>Verwijs een Vriend</strong>-programma. Het is een uitstekende kans om de voordelen van MEXEM te delen met vrienden en familie en daarvoor beloond te worden.',
          sectionTitle: 'Hoe het Programma Werkt',
          step1Title:   'Nodig Uw Vrienden Uit',
          step1Desc:    'Deel uw persoonlijke link via WhatsApp, Telegram, of kopieer de link en stuur deze direct.',
          step2Title:   'Verdien Meer',
          step2Desc:    'Voor elke vriend die zich registreert via uw uitnodiging, ontvangt u <span class="mxr-pill">tot \u20ac150</span> rechtstreeks op uw handelsrekening.',
          step3Title:   'Uw Vrienden Profiteren Ook',
          step3Desc:    'Elke doorverwezen vriend ontvangt <span class="mxr-pill gold">tot \u20ac50</span> om hun MEXEM-ervaring te beginnen.',
          step4Title:   'Volg Uw Succes',
          step4Desc:    'Controleer op elk moment de status van uw verwijzingen.',
          signoff:      'Prettig beleggen,<br><strong>Het MEXEM-team</strong>',
          btnShare:     'Deel Uw Link',
          btnTrack:     'Volg Verwijzingen',
          copied:       '\u2713 Link Gekopieerd!',
          linkLabel:    'Uw verwijzingslink',
        },
        FR: {
          badge:        'Parrainez un Ami',
          heroTitle:    'Invitez des Amis &amp;<br><span>Gagnez jusqu\u2019\u00e0\u00a0150\u00a0\u20ac</span>',
          heroSub:      'Partagez MEXEM et soyez r\u00e9compens\u00e9 \u2014 c\u2019est aussi simple que \u00e7a.',
          greeting:     'Cher(e)',
          intro:        'En tant que client MEXEM, vous pouvez toujours b\u00e9n\u00e9ficier de notre programme <strong>Parrainez un Ami</strong>. C\u2019est une excellente opportunit\u00e9 de partager les avantages de MEXEM avec vos amis et votre famille et d\u2019en \u00eatre r\u00e9compens\u00e9(e).',
          sectionTitle: 'Comment Fonctionne le Programme',
          step1Title:   'Invitez Vos Amis',
          step1Desc:    'Partagez votre lien personnel via WhatsApp, Telegram, ou copiez le lien et envoyez-le directement.',
          step2Title:   'Gagnez Plus',
          step2Desc:    'Pour chaque ami qui s\u2019inscrit via votre invitation, vous recevrez <span class="mxr-pill">jusqu\u2019\u00e0\u00a0150\u00a0\u20ac</span> directement sur votre compte de trading.',
          step3Title:   'Vos Amis Gagnent Aussi',
          step3Desc:    'Chaque ami parrain\u00e9 re\u00e7oit <span class="mxr-pill gold">jusqu\u2019\u00e0\u00a050\u00a0\u20ac</span> pour commencer son exp\u00e9rience MEXEM.',
          step4Title:   'Suivez Vos R\u00e9sultats',
          step4Desc:    'V\u00e9rifiez \u00e0 tout moment le statut de vos parrainages.',
          signoff:      'Bon investissement,<br><strong>L\u2019\u00c9quipe MEXEM</strong>',
          btnShare:     'Partager Mon Lien',
          btnTrack:     'Suivre les Parrainages',
          copied:       '\u2713 Lien Copi\u00e9\u00a0!',
          linkLabel:    'Votre lien de parrainage',
        },
        ES: {
          badge:        'Recomienda a un Amigo',
          heroTitle:    'Invita a Amigos &amp;<br><span>Gana hasta 150\u00a0\u20ac</span>',
          heroSub:      'Comparte MEXEM y recibe recompensas \u2014 as\u00ed de f\u00e1cil.',
          greeting:     'Estimado/a',
          intro:        'Como cliente de MEXEM, siempre puede beneficiarse de nuestro programa <strong>Recomienda a un Amigo</strong>. Es una gran oportunidad para compartir las ventajas de MEXEM con amigos y familiares y ser recompensado/a por ello.',
          sectionTitle: 'C\u00f3mo Funciona el Programa',
          step1Title:   'Invita a Tus Amigos',
          step1Desc:    'Comparte tu enlace personal por WhatsApp, Telegram, o c\u00f3pialo y env\u00edalo directamente.',
          step2Title:   'Gana M\u00e1s',
          step2Desc:    'Por cada amigo que se registre a trav\u00e9s de tu invitaci\u00f3n, recibir\u00e1s <span class="mxr-pill">hasta 150\u00a0\u20ac</span> directamente en tu cuenta de trading.',
          step3Title:   'Tus Amigos Tambi\u00e9n Ganan',
          step3Desc:    'Cada amigo referido recibe <span class="mxr-pill gold">hasta 50\u00a0\u20ac</span> para comenzar su experiencia MEXEM.',
          step4Title:   'Sigue Tu Progreso',
          step4Desc:    'Consulta el estado de tus referencias en cualquier momento.',
          signoff:      'Feliz inversi\u00f3n,<br><strong>El Equipo MEXEM</strong>',
          btnShare:     'Compartir Mi Enlace',
          btnTrack:     'Seguir Referencias',
          copied:       '\u2713 \u00a1Enlace Copiado!',
          linkLabel:    'Tu enlace de referido',
        }
      };

      // Resolve language, fall back to EN
      var supported = ['EN', 'IT', 'NL', 'FR', 'ES'];
      var lang = (LANG && supported.indexOf(LANG.toUpperCase()) !== -1)
        ? LANG.toUpperCase()
        : 'EN';
      var tr = i18n[lang];

      // Inject translations into all [data-i18n] elements inside the widget
      var nodes = widget.querySelectorAll('[data-i18n]');
      nodes.forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (tr[key] !== undefined) {
          el.innerHTML = tr[key];
        }
      });

      // Inject dynamic values from API response
      var nameEl = document.getElementById('mxr-account-name');
      if (nameEl) nameEl.textContent = '';  // not provided by API

      var portalDisplay = document.getElementById('mxr-portal-url-display');
      if (portalDisplay) portalDisplay.textContent = CLIENT_PORTAL_URL;

      var statusLink = document.getElementById('mxr-status-url-display');
      if (statusLink) {
        statusLink.textContent = FRIENDS_STATUS_URL;
        statusLink.href        = FRIENDS_STATUS_URL;
      }

      var trackBtn = document.getElementById('mxr-track-btn');
      if (trackBtn) trackBtn.href = FRIENDS_STATUS_URL;

      // Show the widget
      widget.style.display = 'block';

      // ── Shared clipboard logic ──────────────────────────────────────
      var copyBtn  = document.getElementById('mxr-copy-btn');
      var copyRow  = document.getElementById('mxr-copy-row');
      var copyIcon = document.getElementById('mxr-copy-icon');

      function fallbackCopy(cb) {
        var ta = document.createElement('textarea');
        ta.value = CLIENT_PORTAL_URL;
        ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); cb(); } catch (e) { /* silent */ }
        document.body.removeChild(ta);
      }

      function onCopied() {
        // Feedback on main button
        if (copyBtn) {
          copyBtn.textContent = tr.copied;
          setTimeout(function () { copyBtn.textContent = tr.btnShare; }, 2500);
        }
        // Feedback on icon (swap SVG for a checkmark briefly)
        if (copyIcon) {
          copyIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(function () {
            copyIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
          }, 2500);
        }
      }

      function doCopy() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(CLIENT_PORTAL_URL)
            .then(onCopied)
            .catch(function () { fallbackCopy(onCopied); });
        } else {
          fallbackCopy(onCopied);
        }
      }

      // Main button
      if (copyBtn) copyBtn.addEventListener('click', doCopy);

      // URL row (click anywhere on the row except the icon button itself)
      if (copyRow) {
        copyRow.addEventListener('click', function (e) {
          if (copyIcon && copyIcon.contains(e.target)) return; // icon handles its own click
          doCopy();
        });
      }

      // Copy icon button
      if (copyIcon) copyIcon.addEventListener('click', doCopy);
    }
