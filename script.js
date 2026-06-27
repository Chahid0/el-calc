// ===== THEME & INIT =====
let isDark = false; // الوضع الفاتح هو الافتراضي

function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('light', !isDark);
  document.getElementById('theme-btn').textContent = isDark ? '🌙' : '☀️';
}

// ===== NAVIGATION (HOME & TABS) الخطة المضمونة =====
function goToSection(id) {
  // نغير الرابط فقط (نضيف هاش)، والمتصفح سيتكفل بالباقي
  window.location.hash = id;
}

function switchTab(id, btn) {
  // نغير الرابط فقط
  window.location.hash = id;
}

// هذه الدالة هي التي تقوم بتغيير الشاشات فعلياً استجابةً لتغير الرابط
function updateUI(id) {
  const tabsContainer = document.getElementById('main-tabs');
  if (tabsContainer) {
    if (id === 'home') {
      tabsContainer.style.display = 'none'; // إخفاء الشريط في الشاشة الرئيسية
    } else {
      tabsContainer.style.display = 'flex'; // إظهار الشريط في باقي الصفحات
    }
  }

  // إخفاء كل الأقسام وتفعيل القسم المطلوب
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  
  const targetSection = document.getElementById(id);
  if (targetSection) targetSection.classList.add('active');
  
  // تفعيل الزر في الشريط العلوي لكي يظهر أنه مضغوط
  const targetBtn = document.querySelector(`.tab[onclick="switchTab('${id}', this)"]`) || 
                    document.querySelector(`.tab[onclick*="${id}"]`);
  if (targetBtn) targetBtn.classList.add('active');
}

// ===== HELPERS (دوال مساعدة) =====
function showResult(id, value, detail) {
  document.getElementById(id+'-val').textContent = value;
  document.getElementById(id+'-detail').textContent = detail || '';
  document.getElementById(id+'-result').classList.add('show');
  document.getElementById(id+'-err').style.display = 'none';
}
function showError(id) {
  document.getElementById(id+'-err').style.display = 'block';
  document.getElementById(id+'-result').classList.remove('show');
}
function v(id) { return parseFloat(document.getElementById(id).value); }
function ok(...vals) { return vals.every(x => !isNaN(x) && String(x) !== ''); }

// ===== OHM (قانون أوم) =====
function updateOhmFields() {
  const calc = document.getElementById('ohm-calc').value;
  document.getElementById('ohm-field-R').style.display = calc==='R' ? 'none' : 'flex';
  document.getElementById('ohm-field-I').style.display = calc==='I' ? 'none' : 'flex';
  document.getElementById('ohm-field-U').style.display = calc==='U' ? 'none' : 'flex';
  document.getElementById('ohm-result').classList.remove('show');
}
function calcOhm() {
  const calc = document.getElementById('ohm-calc').value;
  if (calc==='U') {
    const R=v('ohm-R'), I=v('ohm-I');
    if (!ok(R,I)) return showError('ohm');
    showResult('ohm', `U = ${(R*I).toFixed(3)} V`, `U = ${R} Ω × ${I} A`);
  } else if (calc==='R') {
    const U=v('ohm-U'), I=v('ohm-I');
    if (!ok(U,I)||I===0) return showError('ohm');
    showResult('ohm', `R = ${(U/I).toFixed(3)} Ω`, `R = ${U} V / ${I} A`);
  } else {
    const U=v('ohm-U'), R=v('ohm-R');
    if (!ok(U,R)||R===0) return showError('ohm');
    showResult('ohm', `I = ${(U/R).toFixed(3)} A`, `I = ${U} V / ${R} Ω`);
  }
}

// ===== PUISSANCE (القدرة الكهربائية) =====
function calcPuissance() {
  const U=v('p-U'), I=v('p-I'), cos=v('p-cos');
  const type=document.getElementById('p-type').value;
  if (!ok(U,I,cos)) return showError('p');
  const k = type==='tri' ? Math.sqrt(3) : 1;
  const S=k*U*I, P=S*cos, Q=S*Math.sqrt(1-cos*cos);
  showResult('p', `P = ${P.toFixed(1)} W`,
    `${type==='tri'?'Triphasé':'Monophasé'} | S = ${S.toFixed(1)} VA | Q = ${Q.toFixed(1)} VAR`);
}

// ===== MOTEURS (المحركات) =====
function calcGlissement() {
  const Ns=v('g-Ns'), Nr=v('g-Nr');
  if (!ok(Ns,Nr)||Ns===0) return showError('g');
  const g=(Ns-Nr)/Ns*100;
  const q = g<5 ? '✅ Bon' : g<10 ? '⚠️ Élevé' : '❌ Très élevé';
  showResult('g', `g = ${g.toFixed(2)} %`, `Ns=${Ns} | Nr=${Nr} tr/min | ${q}`);
}
function calcVitesse() {
  const f=v('ns-f'), p=v('ns-p');
  if (!ok(f,p)||p===0) return showError('ns');
  showResult('ns', `Ns = ${(60*f/p).toFixed(0)} tr/min`, `f = ${f} Hz | p = ${p} paires de pôles`);
}
function calcRendement() {
  const Pu=v('r-Pu'), Pa=v('r-Pa');
  if (!ok(Pu,Pa)||Pa===0) return showError('r');
  showResult('r', `η = ${(Pu/Pa*100).toFixed(2)} %`, `Pertes = ${(Pa-Pu).toFixed(1)} W`);
}

// ===== TRANSFORMATEURS (المحولات) =====
function calcRapport() {
  const U1=v('m-U1'), U2=v('m-U2');
  if (!ok(U1,U2)||U1===0) return showError('m');
  const m=U2/U1;
  const t = m<1?'🔽 Abaisseur':m>1?'🔼 Élévateur':'➡️ Isolement';
  showResult('m', `m = ${m.toFixed(4)}`, `${t} | U1=${U1} V → U2=${U2} V`);
}
function calcCourantsTransfo() {
  const S=v('ti-S'), U1=v('ti-U1'), U2=v('ti-U2');
  const calc=document.getElementById('ti-calc').value;
  if (!ok(S,U1,U2)) return showError('ti');
  const I1=S/U1, I2=S/U2;
  if (calc==='I1') showResult('ti', `I1 = ${I1.toFixed(3)} A`, `I2 = ${I2.toFixed(3)} A | S = ${S} VA`);
  else showResult('ti', `I2 = ${I2.toFixed(3)} A`, `I1 = ${I1.toFixed(3)} A | S = ${S} VA`);
}
function calcRendementTransfo() {
  const P2=v('rt-P2'), Pfer=v('rt-Pfer'), Pcu=v('rt-Pcu');
  if (!ok(P2,Pfer,Pcu)) return showError('rt');
  const P1=P2+Pfer+Pcu;
  showResult('rt', `η = ${(P2/P1*100).toFixed(2)} %`, `P1 = ${P1.toFixed(1)} W | Pfer=${Pfer} W | Pcu=${Pcu} W`);
}

// ===== CABLAGE (مقطع الكابلات) =====
function calcSection() {
  const type = document.getElementById('cab-type').value;
  const rho = parseFloat(document.getElementById('cab-mat').value);
  const I = v('cab-I');
  const L = v('cab-L');
  const duPerc = v('cab-du-perc');
  const cos = v('cab-cos');

  if (!ok(I, L, duPerc, cos) || I === 0 || L === 0 || duPerc === 0) return showError('cab');

  const U = type === 'mono' ? 230 : 400;
  const deltaU = (duPerc / 100) * U; 
  
  let S = 0;
  if (type === 'mono') {
    S = (2 * rho * L * I * cos) / deltaU;
  } else {
    S = (Math.sqrt(3) * rho * L * I * cos) / deltaU;
  }

  const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
  
  let S_std = standardSections.find(sec => sec >= S);
  if (!S_std) S_std = "Spécial (>300)";

  const matName = rho === 0.0225 ? 'Cuivre' : 'Aluminium';

  showResult('cab', 
    `S = ${S_std} mm²`, 
    `Calcul exact: ${S.toFixed(2)} mm² | ΔU max: ${deltaU.toFixed(1)} V | ${matName}`
  );
}

// ===== LESSONS (الدروس) =====
const lessons = {
  ohm: {
    title: "Loi d'Ohm & Lois de Kirchhoff",
    html: `
      <div class="lesson-section">
        <h3>1. Loi d'Ohm</h3>
        <p>La loi d'Ohm établit la relation entre la tension (U), le courant (I) et la résistance (R) dans un conducteur :</p>
        <div class="lesson-formula">U = R × I &nbsp;&nbsp;→&nbsp;&nbsp; R = U/I &nbsp;&nbsp;→&nbsp;&nbsp; I = U/R</div>
        <table class="lesson-table">
          <tr><th>Grandeur</th><th>Symbole</th><th>Unité</th></tr>
          <tr><td>Tension</td><td>U</td><td>Volt (V)</td></tr>
          <tr><td>Courant</td><td>I</td><td>Ampère (A)</td></tr>
          <tr><td>Résistance</td><td>R</td><td>Ohm (Ω)</td></tr>
        </table>
      </div>
      <div class="lesson-section">
        <h3>2. Loi des Mailles (Kirchhoff en tension)</h3>
        <p>Dans toute maille fermée d'un circuit, la somme algébrique des tensions est nulle :</p>
        <div class="lesson-formula">Σ U = 0 &nbsp;&nbsp;→&nbsp;&nbsp; U1 + U2 + ... = E</div>
      </div>
      <div class="lesson-section">
        <h3>3. Loi des Nœuds (Kirchhoff en courant)</h3>
        <p>En tout nœud d'un circuit, la somme des courants entrants est égale à la somme des courants sortants :</p>
        <div class="lesson-formula">Σ I entrants = Σ I sortants</div>
        <div class="tip-box"><strong>💡 Astuce :</strong> En pratique, appliquez d'abord Kirchhoff pour trouver les courants de branche, puis Ohm pour les tensions.</div>
      </div>
    `
  },
  puissance: {
    title: "Triangle des Puissances",
    html: `
      <div class="lesson-section">
        <h3>1. Les trois types de puissance</h3>
        <table class="lesson-table">
          <tr><th>Puissance</th><th>Symbole</th><th>Unité</th><th>Définition</th></tr>
          <tr><td>Active</td><td>P</td><td>Watt (W)</td><td>Travail réel fourni</td></tr>
          <tr><td>Réactive</td><td>Q</td><td>VAR</td><td>Énergie magnétisante</td></tr>
          <tr><td>Apparente</td><td>S</td><td>VA</td><td>Puissance totale</td></tr>
        </table>
      </div>
      <div class="lesson-section">
        <h3>2. Formules</h3>
        <div class="lesson-formula">Monophasé : S = U × I &nbsp;|&nbsp; P = U × I × cosφ &nbsp;|&nbsp; Q = U × I × sinφ</div>
        <div class="lesson-formula">Triphasé : S = √3 × U × I &nbsp;|&nbsp; P = √3 × U × I × cosφ</div>
        <div class="lesson-formula">Triangle : S² = P² + Q² &nbsp;&nbsp;→&nbsp;&nbsp; cosφ = P / S</div>
      </div>
      <div class="lesson-section">
        <h3>3. Facteur de puissance cosφ</h3>
        <p>Un cosφ proche de 1 signifie une utilisation efficace de l'énergie. En industrie, on vise cosφ ≥ 0,85.</p>
        <p>Pour améliorer cosφ, on ajoute des <strong>condensateurs</strong> en parallèle sur la charge.</p>
        <div class="tip-box"><strong>💡 Important :</strong> Un mauvais cosφ augmente les pertes en ligne et peut entraîner des pénalités du fournisseur d'énergie.</div>
      </div>
    `
  },
  moteur: {
    title: "Moteur Asynchrone Triphasé (MAT)",
    html: `
      <div class="lesson-section">
        <h3>1. Principe de fonctionnement</h3>
        <p>Le stator crée un champ magnétique tournant (CMT) à la vitesse de synchronisme Ns. Ce champ induit des courants dans le rotor, créant un couple qui entraîne le rotor à une vitesse Nr légèrement inférieure à Ns.</p>
        <div class="lesson-formula">Ns = (60 × f) / p &nbsp;&nbsp; [tr/min]</div>
        <p>Avec f = fréquence (Hz) et p = nombre de paires de pôles.</p>
      </div>
      <div class="lesson-section">
        <h3>2. Glissement</h3>
        <p>Le glissement g représente l'écart relatif entre Ns et Nr :</p>
        <div class="lesson-formula">g = (Ns - Nr) / Ns × 100%</div>
        <table class="lesson-table">
          <tr><th>Glissement</th><th>État</th></tr>
          <tr><td>g = 0 %</td><td>Synchronisme (idéal, impossible en pratique)</td></tr>
          <tr><td>1 % &lt; g &lt; 5 %</td><td>Fonctionnement normal ✅</td></tr>
          <tr><td>g &gt; 10 %</td><td>Surcharge ou défaut ❌</td></tr>
        </table>
      </div>
      <div class="lesson-section">
        <h3>3. Démarrage Étoile-Triangle (Y/Δ)</h3>
        <p>Pour réduire le courant de démarrage (× 5 à 8 In), on démarre en couplage étoile (Y) puis on bascule en triangle (Δ) une fois la vitesse atteinte.</p>
        <div class="lesson-formula">Démarrage Y : Ud = U/√3 &nbsp;|&nbsp; Id(Y) = Id(Δ) / 3</div>
        <div class="tip-box"><strong>💡 Rappel :</strong> Le démarrage Y/Δ réduit aussi le couple de démarrage par 3 — à n'utiliser que pour les charges à démarrage à vide.</div>
      </div>
    `
  },
  transformateur: {
    title: "Transformateur — Principe et Calculs",
    html: `
      <div class="lesson-section">
        <h3>1. Principe</h3>
        <p>Le transformateur utilise l'induction mutuelle entre deux bobines (primaire N1 et secondaire N2) pour modifier la tension et le courant sans changer la fréquence.</p>
        <div class="lesson-formula">m = U2/U1 = N2/N1 = I1/I2</div>
      </div>
      <div class="lesson-section">
        <h3>2. Types</h3>
        <table class="lesson-table">
          <tr><th>Type</th><th>m</th><th>Usage</th></tr>
          <tr><td>Élévateur</td><td>m &gt; 1</td><td>Transport HT</td></tr>
          <tr><td>Abaisseur</td><td>m &lt; 1</td><td>Distribution BT</td></tr>
          <tr><td>Isolement</td><td>m = 1</td><td>Sécurité électrique</td></tr>
        </table>
      </div>
      <div class="lesson-section">
        <h3>3. Pertes et Rendement</h3>
        <p><strong>Pertes fer (Pfer)</strong> : dues à l'hystérésis et aux courants de Foucault dans le noyau. Constantes quelle que soit la charge.</p>
        <p><strong>Pertes cuivre (Pcu)</strong> : dues à la résistance des enroulements. Varient avec le carré du courant.</p>
        <div class="lesson-formula">η = P2 / (P2 + Pfer + Pcu) × 100%</div>
        <div class="tip-box"><strong>💡 Info :</strong> Un bon transformateur industriel a un rendement de 97 % à 99 %.</div>
      </div>
    `
  },
  protection: {
    title: "Protections Électriques Industrielles",
    html: `
      <div class="lesson-section">
        <h3>1. Types de défauts</h3>
        <table class="lesson-table">
          <tr><th>Défaut</th><th>Cause</th><th>Protection</th></tr>
          <tr><td>Surcharge</td><td>Courant &gt; In prolongé</td><td>Relais thermique</td></tr>
          <tr><td>Court-circuit</td><td>Courant très élevé</td><td>Fusible / Disjoncteur magnétique</td></tr>
          <tr><td>Défaut à la terre</td><td>Fuite vers la masse</td><td>Différentiel</td></tr>
          <tr><td>Manque de phase</td><td>Une phase coupée</td><td>Relais de phase</td></tr>
        </table>
      </div>
      <div class="lesson-section">
        <h3>2. Disjoncteur magnétothermique</h3>
        <p>Combine deux protections en un seul appareil :</p>
        <p>• <strong>Thermique</strong> : lame bimétallique contre les surcharges (lent)</p>
        <p>• <strong>Magnétique</strong> : électroaimant contre les courts-circuits (instantané)</p>
        <div class="lesson-formula">Calibre In ≥ I_charge &nbsp;&nbsp;|&nbsp;&nbsp; Icc_max ≤ Pouvoir de coupure</div>
      </div>
      <div class="lesson-section">
        <h3>3. Norme NF C 15-100</h3>
        <p>La norme française des installations électriques basse tension définit les règles de protection des personnes et des biens : sélection des câbles, protection contre les chocs électriques, régimes de neutre (TT, TN, IT).</p>
        <div class="tip-box"><strong>💡 Rappel :</strong> Dans les sites industriels, le régime IT est courant pour assurer la continuité de service même en cas de premier défaut.</div>
      </div>
    `
  },
  variateur: {
    title: "Variateur de Vitesse (VFD / Onduleur)",
    html: `
      <div class="lesson-section">
        <h3>1. Principe</h3>
        <p>Le variateur de fréquence (VFD — Variable Frequency Drive) convertit la tension secteur fixe (50 Hz) en une tension à fréquence variable pour contrôler la vitesse du moteur asynchrone :</p>
        <div class="lesson-formula">Ns = (60 × f) / p &nbsp;→&nbsp; modifier f = modifier Ns</div>
      </div>
      <div class="lesson-section">
        <h3>2. Structure interne</h3>
        <table class="lesson-table">
          <tr><th>Étage</th><th>Rôle</th></tr>
          <tr><td>Redresseur</td><td>AC → DC (pont de diodes)</td></tr>
          <tr><td>Bus continu</td><td>Filtrage et stockage énergie</td></tr>
          <tr><td>Onduleur IGBT</td><td>DC → AC à fréquence variable (MLI)</td></tr>
        </table>
      </div>
      <div class="lesson-section">
        <h3>3. Avantages industriels</h3>
        <p>• Économie d'énergie : jusqu'à 50 % sur les pompes et ventilateurs</p>
        <p>• Démarrage progressif → réduit les à-coups mécaniques</p>
        <p>• Contrôle précis de la vitesse et du couple</p>
        <p>• Protection intégrée contre surcharge, surtension, sous-tension</p>
        <div class="tip-box"><strong>💡 Application :</strong> Les ponts roulants utilisent des variateurs pour contrôler précisément la vitesse de levage et de translation.</div>
      </div>
    `
  }
};

function openLesson(key) {
  const l = lessons[key];
  document.getElementById('modal-title').textContent = l.title;
  document.getElementById('modal-body').innerHTML = l.html;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModalBtn() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalBtn();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalBtn(); });

// ===== إعدادات زر الرجوع المضمونة 100% (طريقة الـ Hash) =====

// نراقب أي تغيير في رابط الموقع (سواء بالضغط على زر أو الرجوع بالهاتف)
window.addEventListener('hashchange', function() {
  let currentHash = window.location.hash.replace('#', '') || 'home';
  updateUI(currentHash);
});

// عند فتح التطبيق لأول مرة (نقوم بتحميل الشاشة المناسبة)
window.addEventListener('load', function() {
  let initialHash = window.location.hash.replace('#', '') || 'home';
  updateUI(initialHash);
});
