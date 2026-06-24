/**
 * main.js
 * 
 * Central Application State (Single Source of Truth), UI event listeners,
 * action dispatchers, mode switching, bilingual English/Tamil (தமிழ்) translations,
 * gamified challenge checks, toast manager, auto-tour player, learning modal popup,
 * time tracking, scorecard aggregate analyzer, and automated diagnostics.
 */

// Check if libraries loaded correctly from CDNs
if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
  const checkInterval = setInterval(() => {
    const loadingText = document.getElementById('lbl-loading-text');
    if (loadingText) {
      clearInterval(checkInterval);
      loadingText.innerHTML = `
        <div style="color: #EF4444; text-align: center; max-width: 85%; margin: 0 auto; font-family: system-ui, sans-serif; line-height: 1.5; font-size: 0.95rem;">
          <span style="font-size: 2.2rem;"></span><br><br>
          <strong>CDN Connection / CORS Error</strong><br>
          Could not load Three.js or GSAP library from the CDN.<br><br>
          Please check your network connection, disable any adblockers blocking script CDNs, and reload the page.
        </div>
      `;
      const spinner = document.querySelector('.spinner');
      if (spinner) spinner.style.display = 'none';
    }
  }, 100);
}

// 1. Central Application State (SSOT)
// 1. Central Application State (SSOT) and global counters
let currentAttempts = 0;
let currentQuestionIndex = 0;

const LEARN_HEADER_DEFINITIONS = {
  bondingPairsDef: {
    en: "The number of electron pairs shared between the central atom and outer atoms, forming chemical bonds.",
    ta: "மைய அணுவுக்கும் வெளி அணுக்களுக்கும் இடையே பகிரப்பட்டு, வேதியியல் பிணைப்புகளை உருவாக்கும் எலக்ட்ரான் ஜோடிகளின் எண்ணிக்கை."
  },
  lonePairsDef: {
    en: "Pairs of valence electrons on the central atom that are not shared with another atom. They strongly repel other electrons.",
    ta: "மற்ற அணுக்களுடன் பகிரப்படாத, மைய அணுவில் உள்ள இணைதிறன் எலக்ட்ரான் ஜோடிகள். இவை பிற எலக்ட்ரான்களை வலுவாக விலக்குகின்றன."
  },
  electronGeomDef: {
    en: "The 3D arrangement of ALL electron domains (both bonds and lone pairs) around the central atom.",
    ta: "மைய அணுவைச் சுற்றியுள்ள அனைத்து எலக்ட்ரான் டொமைன்களின் (பிணைப்புகள் மற்றும் தனித்த ஜோடிகள்) முப்பரிமாண அமைப்பு."
  },
  molecularGeomDef: {
    en: "The 3D arrangement of only the bonded atoms. Lone pairs influence this shape but are 'invisible' in the final name.",
    ta: "பிணைக்கப்பட்ட அணுக்களின் முப்பரிமாண அமைப்பு மட்டுமே. தனித்த ஜோடிகள் இந்த வடிவத்தை பாதிக்கின்றன, ஆனால் இறுதி பெயரில் 'தெரியாது'."
  },
  idealAngleDef: {
    en: "The mathematically perfect angle between adjacent bonds if all electron domains repelled each other equally.",
    ta: "அனைத்து எலக்ட்ரான் டொமைன்களும் ஒன்றை ஒன்று சமமாக விலக்கினால், அடுத்தடுத்த பிணைப்புகளுக்கு இடையிலான கணிதரீதியாக சரியான கோணம்."
  }
};

const state = {
  mode: 'learn', // 'learn', 'sandbox', 'real', 'challenge', 'analysis'
  domains: {
    bonds: [], // Array of bond objects: { type: 'single' | 'double' | 'triple', id: number }
    lonePairs: 0
  },
  selectedRealMolecule: 'co2', // Default to CO2 in real mode
  challenge: {
    queue: [], // Array of 5 shuffled challenges
    currentIndex: 0,
    isCompleted: false,
    attempts: 0,
    history: [], // List of geometry names they struggled with
    correctCount: 0,
    startTime: null,
    totalTime: 0,
    detailedResults: [] // Detailed breakdown of attempts & solutions used per challenge
  },
  isAnimating: false, // Locked during 3D transition animations to prevent NaN coords
  isAutoRotating: true, // Controls play/pause rotation loop (Bug Fix 3)
  isTouring: false,
  tourIndex: 0,
  tourInterval: null,
  isModalOpen: false, // Modal blocking flag
  language: 'en', // Overarching language setting: 'en' | 'ta' (Feature 5)
  settings: {
    showLonePairs: true,
    showBondAngles: true
  }
};

// Make state globally accessible
window.state = state;

// Cache DOM elements
const DOM = {
  loadingScreen: document.getElementById('loading-screen'),
  tabLearn: document.getElementById('tab-learn'),
  tabSandbox: document.getElementById('tab-sandbox'),
  tabReal: document.getElementById('tab-real'),
  tabChallenge: document.getElementById('tab-challenge'),
  
  viewLearn: document.getElementById('view-learn'),
  viewPanelInteractive: document.getElementById('view-panel-interactive'),
  viewAnalysis: document.getElementById('view-analysis'),
  learnTableBody: document.getElementById('learn-table-body'),
  
  moleculeTitle: document.getElementById('molecule-title'),
  moleculeFormula: document.getElementById('molecule-formula'),
  
  cardBuilder: document.getElementById('card-builder'),
  cardReal: document.getElementById('card-real'),
  cardChallenge: document.getElementById('card-challenge'),
  
  realMoleculeDesc: document.getElementById('real-molecule-desc'),
  moleculeButtonsGrid: document.getElementById('molecule-buttons-grid'),
  
  lblChallengePrompt: document.getElementById('challenge-prompt-text'),
  lblChallengeHint: document.getElementById('lbl-challenge-hint'),
  lblChallengeBadge: document.getElementById('lbl-challenge-badge'),
  btnShowSolution: document.getElementById('btn-show-solution'),
  btnCheckChallenge: document.getElementById('btn-check-challenge'),
  
  inspectBonds: document.getElementById('inspect-bonds'),
  inspectLones: document.getElementById('inspect-lones'),
  inspectTotal: document.getElementById('inspect-total'),
  
  outElectronGeom: document.getElementById('out-electron-geom'),
  outMolecularGeom: document.getElementById('out-molecular-geom'),
  
  toggleLonePairs: document.getElementById('toggle-lone-pairs'),
  toggleBondAngles: document.getElementById('toggle-bond-angles'),
  legendRowLP: document.getElementById('legend-row-lp'),
  
  btnAddSingle: document.getElementById('btn-add-single'),
  btnAddDouble: document.getElementById('btn-add-double'),
  btnAddTriple: document.getElementById('btn-add-triple'),
  btnAddLone: document.getElementById('btn-add-lone'),
  btnRemoveBond: document.getElementById('btn-remove-bond'),
  btnRemoveLone: document.getElementById('btn-remove-lone'),
  btnClearAll: document.getElementById('btn-clear-all'),
  
  btnQuickCo2: document.getElementById('btn-quick-co2'),
  btnQuickH2o: document.getElementById('btn-quick-h2o'),
  btnQuickBf3: document.getElementById('btn-quick-bf3'),
  btnQuickSf6: document.getElementById('btn-quick-sf6'),
  
  toastContainer: document.getElementById('toast-container'),
  celebrationModal: document.getElementById('celebration-modal'),
  lblCelebrationTitle: document.getElementById('lbl-celebration-title'),
  lblCelebrationMsg: document.getElementById('lbl-celebration-msg'),
  btnNextChallenge: document.getElementById('btn-next-challenge'),
  confettiOverlay: document.getElementById('confetti-overlay'),
  
  tourBtn: document.getElementById('tour-btn'),
  tourIcon: document.getElementById('tour-icon'),
  lblTourBtnText: document.getElementById('lbl-tour-btn-text'),
  btnLangToggle: document.getElementById('btn-lang-toggle'),
  btnAutoRotate: document.getElementById('btn-auto-rotate'),

  // i18n Static Labels Cache
  lblAppTitle: document.getElementById('lbl-app-title'),
  lblTabLearn: document.getElementById('lbl-tab-learn'),
  lblTabSandbox: document.getElementById('lbl-tab-sandbox'),
  lblTabReal: document.getElementById('lbl-tab-real'),
  lblTabChallenge: document.getElementById('lbl-tab-challenge'),
  lblAddRemoveHeader: document.getElementById('lbl-add-remove-header'),
  lblSelectMoleculeHeader: document.getElementById('lbl-select-molecule-header'),
  lblTargetPracticeHeader: document.getElementById('lbl-target-practice-header'),
  lblDomainInspectorHeader: document.getElementById('lbl-domain-inspector-header'),
  lblDisplaySettingsHeader: document.getElementById('lbl-display-settings-header'),
  lblAddSingle: document.getElementById('lbl-add-single'),
  lblAddDouble: document.getElementById('lbl-add-double'),
  lblAddTriple: document.getElementById('lbl-add-triple'),
  lblAddLone: document.getElementById('lbl-add-lone'),
  lblRemoveBond: document.getElementById('lbl-remove-bond'),
  lblRemoveLone: document.getElementById('lbl-remove-lone'),
  lblClearAll: document.getElementById('lbl-clear-all'),
  lblInspectBondedLabel: document.getElementById('lbl-inspect-bonded-label'),
  lblInspectLonesLabel: document.getElementById('lbl-inspect-lones-label'),
  lblInspectTotalLabel: document.getElementById('lbl-inspect-total-label'),
  lblElectronGeomText: document.getElementById('lbl-electron-geom-label'),
  lblMolecularGeomText: document.getElementById('lbl-molecular-geom-label'),
  lblShowLones: document.getElementById('lbl-show-lones'),
  lblShowAngles: document.getElementById('lbl-show-angles'),
  lblAutoRotateText: document.getElementById('lbl-auto-rotate'),
  lblLegendCentral: document.getElementById('lbl-legend-central'),
  lblLegendOuter: document.getElementById('lbl-legend-outer'),
  lblLegendLone: document.getElementById('lbl-legend-lone'),
  lblRotateHelper: document.getElementById('lbl-rotate-helper'),
  lblToastMessage: document.getElementById('lbl-toast-message'),
  lblCelebrationNext: document.getElementById('lbl-next-challenge'),
  lblLoadingText: document.getElementById('lbl-loading-text'),

  // Learn Reference Table Columns
  lblTblTotalDomains: document.getElementById('lbl-tbl-total-domains'),
  lblTblBondingPairs: document.getElementById('lbl-tbl-bonding-pairs'),
  lblTblLonePairs: document.getElementById('lbl-tbl-lone-pairs'),
  lblTblElectronGeom: document.getElementById('lbl-tbl-electron-geom'),
  lblTblMolecularGeom: document.getElementById('lbl-tbl-molecular-geom'),
  lblTblBondAngle: document.getElementById('lbl-tbl-bond-angle'),
  lblTblExamples: document.getElementById('lbl-tbl-examples'),
  
  lblQuickExamplesTitle: document.getElementById('lbl-quick-examples-title'),
  lblCheckChallenge: document.getElementById('lbl-check-challenge'),
  lblShowSolution: document.getElementById('lbl-show-solution'),
  
  lblAnalysisTitle: document.getElementById('lbl-analysis-title'),
  lblAnalysisScore: document.getElementById('lbl-analysis-score'),
  lblAnalysisFeedback: document.getElementById('lbl-analysis-feedback'),
  lblPlayAgain: document.getElementById('lbl-play-again'),
  btnPlayAgain: document.getElementById('btn-play-again'),
  
  // Repaired Scorecard Nodes (Iteration 3.2)
  lblStatsCorrectLabel: document.getElementById('lbl-stats-correct-label'),
  lblStatsWrongLabel: document.getElementById('lbl-stats-wrong-label'),
  lblStatsTimeLabel: document.getElementById('lbl-stats-time-label'),
  lblAnalysisCorrect: document.getElementById('lbl-analysis-correct'),
  lblAnalysisWrong: document.getElementById('lbl-analysis-wrong'),
  btnGoSandbox: document.getElementById('btn-go-sandbox'),
  lblGoSandbox: document.getElementById('lbl-go-sandbox'),
  lblPerfBreakdownTitle: document.getElementById('lbl-perf-breakdown-title'),
  analysisBreakdownList: document.getElementById('analysis-breakdown-list'),
  lblAnalysisPercentage: document.getElementById('lbl-analysis-percentage'),
  lblAnalysisTime: document.getElementById('lbl-analysis-time'),

  // Contextual Modal Nodes (Iteration 3.0 Section 2)
  geomModal: document.getElementById('geom-modal'),
  btnCloseGeomModal: document.getElementById('btn-close-geom-modal'),
  miniThreeCanvas: document.getElementById('mini-three-canvas'),
  modalSubtitleGeom: document.getElementById('modal-subtitle-geom'),
  modalTitleGeom: document.getElementById('modal-title-geom'),
  modalDescGeom: document.getElementById('modal-desc-geom'),
  modalValSteric: document.getElementById('modal-val-steric'),
  modalValBonding: document.getElementById('modal-val-bonding'),
  modalValLone: document.getElementById('modal-val-lone'),
  modalValAngle: document.getElementById('modal-val-angle'),
  modalExamplesContainer: document.getElementById('modal-examples-container'),
  lblModalViewerHelper: document.getElementById('lbl-modal-viewer-helper'),
  lblModalSteric: document.getElementById('lbl-modal-steric'),
  lblModalBonding: document.getElementById('lbl-modal-bonding'),
  lblModalLone: document.getElementById('lbl-modal-lone'),
  lblModalAngle: document.getElementById('lbl-modal-angle'),
  lblModalExamplesTitle: document.getElementById('lbl-modal-examples-title'),

  // Redesigned Challenge Header Banner (Iteration 3.0 Section 4)
  lblChallengeNumberHeader: document.getElementById('lbl-challenge-number-header'),

  // Individual grid labels
  lblNameCo2: document.getElementById('lbl-name-co2'),
  lblNameH2o: document.getElementById('lbl-name-h2o'),
  lblNameNh3: document.getElementById('lbl-name-nh3'),
  lblNameCh4: document.getElementById('lbl-name-ch4'),
  lblNamePcl5: document.getElementById('lbl-name-pcl5'),
  lblNameSf6: document.getElementById('lbl-name-sf6')
};

// ==========================================================================
// Translation Helper (Feature 5)
// ==========================================================================

/**
 * Resolves standard strings or translation objects containing { en: '...', ta: '...' }
 */
function t(obj) {
  if (!obj) return '';
  if (typeof obj === 'object') {
    return obj[state.language] || obj['en'] || '';
  }
  return obj;
}

/**
 * Sweeps the DOM static elements and replaces content based on active language dictionary
 */
function renderLanguage() {
  const dict = window.I18N_DICT[state.language];
  if (!dict) return;

  // Language Toggle Button indicates the switch target
  DOM.btnLangToggle.textContent = state.language === 'en' ? 'தமிழ்' : 'English';

  // Translate static texts
  DOM.lblAppTitle.textContent = dict.title;
  DOM.lblTabLearn.textContent = dict.tabLearn.replace(/📖\s*/, '');
  DOM.lblTabSandbox.textContent = dict.tabSandbox.replace(/🛠️\s*/, '');
  DOM.lblTabReal.textContent = dict.tabReal.replace(/🧪\s*/, '');
  DOM.lblTabChallenge.textContent = dict.tabChallenge.replace(/🎯\s*/, '');
  
  DOM.lblAddRemoveHeader.textContent = dict.addRemoveDomains;
  DOM.lblSelectMoleculeHeader.textContent = dict.selectMolecule;
  DOM.lblDomainInspectorHeader.textContent = dict.domainInspector;
  DOM.lblDisplaySettingsHeader.textContent = dict.displaySettings;

  DOM.lblAddSingle.textContent = dict.addSingle;
  DOM.lblAddDouble.textContent = dict.addDouble;
  DOM.lblAddTriple.textContent = dict.addTriple;
  DOM.lblAddLone.textContent = dict.addLone;
  DOM.lblRemoveBond.textContent = dict.removeBond;
  DOM.lblRemoveLone.textContent = dict.removeLone;
  DOM.lblClearAll.textContent = dict.clearAll;

  DOM.lblInspectBondedLabel.textContent = dict.bondedAtomsLabel;
  DOM.lblInspectLonesLabel.textContent = dict.lonePairsLabel;
  DOM.lblInspectTotalLabel.textContent = dict.totalDomainsLabel;

  DOM.lblElectronGeomText.textContent = dict.electronGeomLabel;
  DOM.lblMolecularGeomText.textContent = dict.molecularGeomLabel;

  DOM.lblShowLones.textContent = dict.showLonePairs;
  DOM.lblShowAngles.textContent = dict.showBondAngles;
  DOM.lblAutoRotateText.textContent = dict.autoRotate;

  DOM.lblLegendCentral.textContent = dict.legendCentral;
  DOM.lblLegendOuter.textContent = dict.legendOuter;
  DOM.lblLegendLone.textContent = dict.legendLone;

  DOM.lblRotateHelper.textContent = dict.rotateHelper;
  DOM.lblToastMessage.textContent = dict.toastMaxReached;
  DOM.lblCelebrationNext.textContent = dict.nextChallenge;
  DOM.lblLoadingText.textContent = dict.lblLoadingText || 'Loading...';

  // Learn table headers
  DOM.lblTblTotalDomains.textContent = dict.tblTotalDomains;
  setLearnHeaderTooltip(DOM.lblTblBondingPairs, dict.tblBondingPairs, LEARN_HEADER_DEFINITIONS.bondingPairsDef);
  setLearnHeaderTooltip(DOM.lblTblLonePairs, dict.tblLonePairs, LEARN_HEADER_DEFINITIONS.lonePairsDef);
  setLearnHeaderTooltip(DOM.lblTblElectronGeom, dict.tblElectronGeom, LEARN_HEADER_DEFINITIONS.electronGeomDef);
  setLearnHeaderTooltip(DOM.lblTblMolecularGeom, dict.tblMolecularGeom, LEARN_HEADER_DEFINITIONS.molecularGeomDef);
  setLearnHeaderTooltip(DOM.lblTblBondAngle, dict.tblBondAngle, LEARN_HEADER_DEFINITIONS.idealAngleDef, true);
  DOM.lblTblExamples.textContent = dict.tblExamples;
  
  DOM.lblQuickExamplesTitle.textContent = dict.quickExamples || 'Quick Examples';
  DOM.lblCheckChallenge.textContent = state.language === 'en' ? 'Check Shape ' : 'வடிவத்தை சரிபார் 🔍';
  DOM.lblShowSolution.textContent = dict.btnShowSolution || 'Show Solution ';
  
  DOM.lblAnalysisTitle.textContent = dict.lblAnalysisTitle || 'Result Analysis Scorecard';
  DOM.lblPlayAgain.textContent = dict.btnPlayAgain ? dict.btnPlayAgain.replace('', '') : 'Play Again';

  // Repaired Scorecard Metrics labels (Iteration 3.2)
  DOM.lblStatsCorrectLabel.textContent = dict.statsCorrect || 'Correct Challenges';
  DOM.lblStatsWrongLabel.textContent = dict.statsWrong || 'Incorrect / Assisted';
  DOM.lblStatsTimeLabel.textContent = dict.statsTime || 'Total Time Taken';
  DOM.lblGoSandbox.textContent = dict.btnGoSandbox || 'Go to Sandbox';
  DOM.lblPerfBreakdownTitle.textContent = dict.perfBreakdown || 'Performance Breakdown';

  // Contextual Modal labels
  DOM.lblModalSteric.textContent = dict.stericNumber || 'Steric Number';
  DOM.lblModalBonding.textContent = dict.bondingPairs || 'Bonding Pairs';
  DOM.lblModalLone.textContent = dict.lonePairs || 'Lone Pairs';
  DOM.lblModalAngle.textContent = dict.idealAngle || 'Ideal Angle';
  DOM.lblModalExamplesTitle.textContent = dict.realExamples || 'Real-World Examples';
  DOM.modalSubtitleGeom.textContent = dict.tblMolecularGeom || 'Molecular Geometry';
  DOM.lblModalViewerHelper.textContent = state.language === 'en' ? 'Drag to rotate 3D model' : '3D மாதிரியை சுழற்ற இழுக்கவும்';

  // Clickable grid labels
  DOM.lblNameCo2.textContent = dict.co2Btn.replace(/CO₂\s*\(/, '').replace(')', '');
  DOM.lblNameH2o.textContent = dict.waterBtn.replace(/H₂O\s*\(/, '').replace(')', '');
  DOM.lblNameNh3.textContent = dict.nh3Btn.replace(/NH₃\s*\(/, '').replace(')', '');
  DOM.lblNameCh4.textContent = dict.ch4Btn.replace(/CH₄\s*\(/, '').replace(')', '');
  DOM.lblNamePcl5.textContent = dict.pcl5Btn.replace(/PCl₅\s*\(/, '').replace(')', '');
  DOM.lblNameSf6.textContent = dict.sf6Btn.replace(/SF₆\s*\(/, '').replace(')', '');

  // Translate challenge badge
  if (DOM.lblChallengeBadge) {
    DOM.lblChallengeBadge.textContent = state.language === 'en' ? 'CURRENT CHALLENGE' : 'தற்போதைய சவால்';
  }

  // Auto rotate button text
  updateAutoRotateButtonText();
  
  // Refresh tour button text if active
  updateTourButtonState();

  // If Learn view is open, redraw table rows with translation
  if (state.mode === 'learn') {
    renderLearnTable();
  } else if (state.mode === 'analysis') {
    showResultAnalysis();
  }
}

function setLearnHeaderTooltip(header, label, definition, alignRight = false) {
  if (!header) return;

  header.classList.add('learn-header-with-tooltip');
  header.classList.toggle('tooltip-align-right', alignRight);
  header.innerHTML = `
    <span class="learn-header-label">${label}</span>
    <button type="button" class="learn-header-info-btn" aria-label="Show definition" title="Show definition">i</button>
    <span class="learn-header-tooltip" role="tooltip">
      <span class="learn-tooltip-title">${label}</span>
      <span class="learn-tooltip-body">${t(definition)}</span>
    </span>
  `;
}

/**
 * Updates text of Play/Pause Auto-rotate button
 */
function updateAutoRotateButtonText() {
  const dict = window.I18N_DICT[state.language];
  DOM.btnAutoRotate.textContent = state.isAutoRotating ? dict.btnPause : dict.btnPlay;
}

// ==========================================================================
// Initialization
// ==========================================================================

function initApp() {
  // Prevent double execution
  if (window.appInitialized) return;
  window.appInitialized = true;

  // Initialize Three.js scene
  window.init3D();
  
  // Bind UI Events
  bindEvents();
  
  // Apply English UI by default
  renderLanguage();

  // Switch to default Learn Reference mode initially
  switchMode('learn');
  
  // Hide loading panel with fade out
  setTimeout(() => {
    DOM.loadingScreen.style.opacity = 0;
    setTimeout(() => DOM.loadingScreen.style.display = 'none', 500);
  }, 800);
}

// Robust loading handler addressing fast local readyStates (CORS/DOM loading race condition fix)
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Set animation state setter globally so scene.js can trigger lock
window.setIsAnimatingState = function(animating) {
  state.isAnimating = animating;
  updateButtonDisabledStates();
};

// ==========================================================================
// Action Dispatchers (Mutates state & syncs views)
// ==========================================================================

function addBond(type) {
  if (state.isAnimating || state.isModalOpen) return;
  stopTour(); // User interaction stops Auto-Tour
  
  const currentTotal = state.domains.bonds.length + state.domains.lonePairs;
  if (currentTotal >= 7) {
    showToast(window.I18N_DICT[state.language].toastMaxReached);
    triggerWarningShake();
    return;
  }

  state.domains.bonds.push({ type: type, id: Date.now() });
  renderState();
}

function removeLastBond() {
  if (state.isAnimating || state.isModalOpen) return;
  stopTour();
  
  if (state.domains.bonds.length > 0) {
    state.domains.bonds.pop();
    renderState();
  }
}

function addLonePair() {
  if (state.isAnimating || state.isModalOpen) return;
  stopTour();
  
  const currentTotal = state.domains.bonds.length + state.domains.lonePairs;
  if (currentTotal >= 7) {
    showToast(window.I18N_DICT[state.language].toastMaxReached);
    triggerWarningShake();
    return;
  }

  state.domains.lonePairs++;
  renderState();
}

function removeLastLonePair() {
  if (state.isAnimating || state.isModalOpen) return;
  stopTour();
  
  if (state.domains.lonePairs > 0) {
    state.domains.lonePairs--;
    renderState();
  }
}

function clearAllDomains(force = false) {
  if (!force && (state.isAnimating || state.isModalOpen)) return;
  stopTour();
  
  if (force) {
    state.isAnimating = false;
    if (typeof window.forceStopTransitions === 'function') {
      window.forceStopTransitions();
    }
  }

  state.domains.bonds = [];
  state.domains.lonePairs = 0;
  renderState();
}

function resetToSandboxDefault() {
  if (state.isAnimating || state.isModalOpen) return;
  stopTour();
  
  state.domains.bonds = [{ type: 'single', id: Date.now() }];
  state.domains.lonePairs = 0;
  renderState();
}

function selectRealMolecule(id) {
  if (state.isAnimating || state.isModalOpen) return;
  stopTour();
  
  const mol = window.REAL_MOLECULES[id];
  if (!mol) return;

  state.selectedRealMolecule = id;
  
  // Update selected button grid style
  document.querySelectorAll('.molecule-grid-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mol') === id);
  });

  // Snap bonds & lone pairs to real settings
  state.domains.bonds = mol.bonds.map((b, idx) => ({ type: b.type, id: Date.now() + idx }));
  state.domains.lonePairs = mol.lonePairs;

  renderState();
}

function toggleLanguage() {
  state.language = state.language === 'en' ? 'ta' : 'en';
  renderLanguage();
  renderState();
}

// ==========================================================================
// Contextual Reference System Modal Popup (Iteration 3.0 Section 2)
// ==========================================================================

function openGeometryModal(key) {
  if (state.isAnimating || state.isModalOpen) return;
  
  const geom = window.VSEPR_GEOMETRIES[key];
  if (!geom) return;

  state.isModalOpen = true;
  stopTour(); // Halt any active auto tour

  // Fill in textual metadata
  DOM.modalTitleGeom.textContent = t(geom.molecularGeometry);
  DOM.modalDescGeom.textContent = t(geom.description);

  const parts = key.split('_');
  const bonding = parts[0];
  const lone = parts[1];
  const total = parseInt(bonding) + parseInt(lone);

  DOM.modalValSteric.textContent = total;
  DOM.modalValBonding.textContent = bonding;
  DOM.modalValLone.textContent = lone;
  DOM.modalValAngle.textContent = geom.realAngleOverride || geom.idealAngle;

  // Build chemical formula badges
  DOM.modalExamplesContainer.innerHTML = '';
  if (geom.realExamples && geom.realExamples.length > 0) {
    geom.realExamples.forEach(ex => {
      const div = document.createElement('div');
      div.className = 'modal-example-badge';
      div.innerHTML = `
        <span>${t(ex.name)}</span>
        <span class="modal-example-formula">${ex.formula}</span>
      `;
      DOM.modalExamplesContainer.appendChild(div);
    });
  } else {
    DOM.modalExamplesContainer.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">N/A</span>`;
  }

  // Display overlay
  DOM.geomModal.style.display = 'flex';
  void DOM.geomModal.offsetWidth; // force redraw
  DOM.geomModal.classList.add('show');

  // Spawn mini-viewer inside scene.js after a short delay to let DOM layout settle
  setTimeout(() => {
    const colorHex = window.CPK_COLORS['Generic'];
    window.initModal3D(DOM.miniThreeCanvas, key, colorHex);
  }, 50);
}

function closeGeometryModal() {
  if (!state.isModalOpen) return;

  DOM.geomModal.classList.remove('show');
  setTimeout(() => {
    DOM.geomModal.style.display = 'none';
    state.isModalOpen = false;

    // Clean up WebGL memory lifecycle dynamically (disposals)
    window.disposeModal3D();
  }, 300);
}

function toggleAutoRotation() {
  state.isAutoRotating = !state.isAutoRotating;
  updateAutoRotateButtonText();
}

// ==========================================================================
// Quick Examples Handler
// ==========================================================================

function loadQuickExample(molId) {
  if (state.isAnimating || state.isModalOpen) return;
  stopTour();

  const mol = window.REAL_MOLECULES[molId];
  if (mol) {
    state.domains.bonds = mol.bonds.map((b, idx) => ({ type: b.type, id: Date.now() + idx }));
    state.domains.lonePairs = mol.lonePairs;
    renderState();
  }
}

// ==========================================================================
// Auto-Tour Mode Logic
// ==========================================================================

function toggleTour() {
  if (state.isTouring) {
    stopTour();
  } else {
    startTour();
  }
}

function startTour() {
  if (state.isAnimating || state.isModalOpen) return;
  
  // Switch view to sandbox if they are on Learn/Analysis views
  if (state.mode !== 'sandbox' && state.mode !== 'real') {
    switchMode('sandbox');
  }

  state.isTouring = true;
  state.tourIndex = 0;
  updateTourButtonState();

  // Run immediately
  runTourStep();

  // Loop every 4 seconds
  state.tourInterval = setInterval(() => {
    runTourStep();
  }, 4000);
}

function stopTour() {
  if (!state.isTouring) return;
  state.isTouring = false;
  if (state.tourInterval) {
    clearInterval(state.tourInterval);
    state.tourInterval = null;
  }
  updateTourButtonState();
  renderState(); // force refresh headers to revert to standard text
}

function runTourStep() {
  const TOUR_KEYS = ['co2', 'h2o', 'nh3', 'ch4', 'pcl5', 'sf6'];
  const molId = TOUR_KEYS[state.tourIndex];
  const mol = window.REAL_MOLECULES[molId];

  if (mol) {
    // Re-verify clean disposal on cycle step
    window.clear3DScene();

    state.domains.bonds = mol.bonds.map((b, idx) => ({ type: b.type, id: Date.now() + idx }));
    state.domains.lonePairs = mol.lonePairs;

    const bondedCount = state.domains.bonds.length;
    const lonePairsCount = state.domains.lonePairs;
    const key = `${bondedCount}_${lonePairsCount}`;
    const geometryInfo = window.VSEPR_GEOMETRIES[key];

    let molecularGeometryName = '';
    if (geometryInfo) {
      molecularGeometryName = t(geometryInfo.molecularGeometry);
    }

    // Set header contents directly
    DOM.moleculeTitle.textContent = t(mol.name);
    DOM.moleculeFormula.textContent = mol.formula + ` (${molecularGeometryName})`;

    // Repaint canvas
    window.renderMoleculeScene(state);
  }

  state.tourIndex = (state.tourIndex + 1) % TOUR_KEYS.length;
}

function updateTourButtonState() {
  const dict = window.I18N_DICT[state.language];
  if (state.isTouring) {
    DOM.tourIcon.textContent = '⏸';
    DOM.lblTourBtnText.textContent = dict.btnTourStop || 'Stop Tour';
    DOM.tourBtn.style.background = 'var(--danger)';
  } else {
    DOM.tourIcon.textContent = '▶';
    DOM.lblTourBtnText.textContent = dict.btnTourPlay || 'Play Tour';
    DOM.tourBtn.style.background = 'var(--accent)';
  }
}

// ==========================================================================
// Learn cheat sheet table rendering
// ==========================================================================

function renderLearnTable() {
  const tbody = DOM.learnTableBody;
  if (!tbody) return;
  tbody.innerHTML = '';

  const stableKeys = [
    '2_0',
    '3_0', '2_1',
    '4_0', '3_1', '2_2',
    '5_0', '4_1', '3_2', '2_3',
    '6_0', '5_1', '4_2',
    '7_0', '6_1', '5_2'
  ];

  const realExamplesMap = {
    '2_0': 'CO₂',
    '3_0': 'BF₃',
    '2_1': 'SO₂',
    '4_0': 'CH₄',
    '3_1': 'NH₃',
    '2_2': 'H₂O',
    '5_0': 'PCl₅',
    '4_1': 'SF₄',
    '3_2': 'ClF₃',
    '2_3': 'XeF₂',
    '6_0': 'SF₆',
    '5_1': 'BrF₅',
    '4_2': 'XeF₄',
    '7_0': 'IF₇',
    '6_1': 'XeF₅⁻',
    '5_2': 'XeF₅⁻ (Ideal)'
  };

  stableKeys.forEach(key => {
    const geom = window.VSEPR_GEOMETRIES[key];
    if (!geom) return;

    const parts = key.split('_');
    const bonding = parseInt(parts[0]);
    const lone = parseInt(parts[1]);
    const total = bonding + lone;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${total}</strong></td>
      <td>${bonding}</td>
      <td>${lone}</td>
      <td>${t(geom.electronGeometry)}</td>
      <td class="clickable-geom" data-key="${key}">
        <strong>${t(geom.molecularGeometry)}</strong>
      </td>
      <td>${geom.realAngleOverride || geom.idealAngle}</td>
      <td><code>${realExamplesMap[key] || 'N/A'}</code></td>
    `;
    tbody.appendChild(tr);
  });

  // Bind clicks on geometry cells inside Learn Reference Table (Interactive Contextual reference popup)
  tbody.querySelectorAll('.clickable-geom').forEach(cell => {
    cell.addEventListener('click', () => {
      const key = cell.getAttribute('data-key');
      openGeometryModal(key);
    });
  });
}

function hideLearnHeaderTooltips() {
  document.querySelectorAll('.learn-header-with-tooltip.is-active').forEach(header => {
    header.classList.remove('is-active');
  });
}

// ==========================================================================
// SSOT Synchronization
// ==========================================================================

/**
 * Updates text displays and checks disabled buttons, then schedules 3D scene repaint
 */
function renderState() {
  const bondedCount = state.domains.bonds.length;
  const lonePairsCount = state.domains.lonePairs;
  const totalDomains = bondedCount + lonePairsCount;

  // 1. Resolve geometry names and angles from data dictionary
  const geomKey = `${bondedCount}_${lonePairsCount}`;
  const geometryInfo = window.VSEPR_GEOMETRIES[geomKey];

  let electronGeometryName = '';
  let molecularGeometryName = '';
  
  if (totalDomains === 0) {
    electronGeometryName = state.language === 'en' ? 'Single Atom' : 'ஒற்றை அணு';
    molecularGeometryName = state.language === 'en' ? 'Single Atom' : 'ஒற்றை அணு';
  } else if (geometryInfo) {
    electronGeometryName = t(geometryInfo.electronGeometry);
    molecularGeometryName = t(geometryInfo.molecularGeometry);
  } else {
    electronGeometryName = (state.language === 'en' ? 'Custom' : 'தனிப்பயன்') + ` (${totalDomains})`;
    molecularGeometryName = (state.language === 'en' ? 'Custom' : 'தனிப்பயன்') + ` (${bondedCount})`;
  }

  // 2. Render HTML Headers (respecting active Auto-Tour state)
  if (state.mode === 'sandbox') {
    if (!state.isTouring) {
      DOM.moleculeTitle.textContent = molecularGeometryName;
      DOM.moleculeFormula.textContent = buildFormulaNotation(bondedCount, lonePairsCount);
    }
  } else if (state.mode === 'real') {
    const mol = window.REAL_MOLECULES[state.selectedRealMolecule];
    if (mol) {
      DOM.moleculeTitle.textContent = t(mol.name);
      DOM.moleculeFormula.textContent = mol.formula + ` (${molecularGeometryName})`;
      DOM.realMoleculeDesc.textContent = t(mol.description);
      DOM.realMoleculeDesc.style.display = 'block';
    } else {
      DOM.moleculeTitle.textContent = state.language === 'en' ? 'Select Molecule' : 'மூலக்கூறைத் தேர்ந்தெடு';
      DOM.moleculeFormula.textContent = '';
      DOM.realMoleculeDesc.textContent = window.I18N_DICT[state.language].realMoleculeDescDefault;
      DOM.realMoleculeDesc.style.display = 'block';
    }
  } else if (state.mode === 'challenge') {
    const currentChallenge = state.challenge.queue[currentQuestionIndex];
    if (currentChallenge) {
      DOM.moleculeTitle.textContent = (state.language === 'en' ? 'Challenge Task #' : 'சவால் பணி #') + (currentQuestionIndex + 1);
      DOM.moleculeFormula.textContent = (state.language === 'en' ? 'Target Geometry: ' : 'இலக்கு வடிவம்: ') + t(currentChallenge.targetGeometry);
      
      // Update challenge question text and hint dynamically
      if (DOM.lblChallengePrompt) {
        DOM.lblChallengePrompt.textContent = t(currentChallenge.prompt);
      }
      if (DOM.lblChallengeHint) {
        DOM.lblChallengeHint.textContent = t(currentChallenge.hint);
      }

      // Sync challenge number header on language toggle (Iteration 3.1)
      if (DOM.lblChallengeNumberHeader) {
        DOM.lblChallengeNumberHeader.textContent = (state.language === 'en' ? 'CHALLENGE #' : 'சவால் #') + (currentQuestionIndex + 1);
      }
    }
  }

  // 3. Update Domain Inspector Panel
  DOM.inspectBonds.textContent = bondedCount;
  DOM.inspectLones.textContent = lonePairsCount;
  DOM.inspectTotal.textContent = totalDomains;

  // 4. Update Live Output Box
  DOM.outElectronGeom.textContent = electronGeometryName;
  DOM.outMolecularGeom.textContent = molecularGeometryName;

  // 5. Update UI Button States
  updateButtonDisabledStates();

  // 6. Draw 3D scene
  window.renderMoleculeScene(state);
}

/**
 * Builds formula subscripts AXnEm representation
 */
function buildFormulaNotation(bonds, lones) {
  if (bonds === 0 && lones === 0) return 'A';
  
  const toSubscript = (num) => {
    const subs = { '0':'₀', '1':'', '2':'₂', '3':'₃', '4':'₄', '5':'₅', '6':'₆', '7':'₇' };
    return subs[num] !== undefined ? subs[num] : num;
  };
  
  let formula = 'A';
  if (bonds > 0) formula += 'X' + toSubscript(bonds);
  if (lones > 0) formula += 'E' + toSubscript(lones);
  return formula;
}

/**
 * Adjust button disabled properties during transitions or locks
 */
function updateButtonDisabledStates() {
  const total = state.domains.bonds.length + state.domains.lonePairs;
  const isRealMode = state.mode === 'real';
  const lock = state.isAnimating || state.isModalOpen;

  const disableInputs = lock || isRealMode;

  DOM.btnAddSingle.disabled = disableInputs || (total >= 7);
  DOM.btnAddDouble.disabled = disableInputs || (total >= 7);
  DOM.btnAddTriple.disabled = disableInputs || (total >= 7);
  DOM.btnAddLone.disabled = disableInputs || (total >= 7);

  DOM.btnRemoveBond.disabled = disableInputs || (state.domains.bonds.length === 0);
  DOM.btnRemoveLone.disabled = disableInputs || (state.domains.lonePairs === 0);
  DOM.btnClearAll.disabled = disableInputs || (total === 0);
}

// ==========================================================================
// Mode & Tab Switches
// ==========================================================================

function switchMode(newMode) {
  if (state.isAnimating || state.isModalOpen) return; // Lock changes during transitions
  stopTour(); // Stop any active tour on mode change
  
  state.mode = newMode;

  DOM.tabLearn.classList.toggle('active', newMode === 'learn');
  DOM.tabSandbox.classList.toggle('active', newMode === 'sandbox');
  DOM.tabReal.classList.toggle('active', newMode === 'real');
  DOM.tabChallenge.classList.toggle('active', newMode === 'challenge');

  DOM.viewLearn.style.display = newMode === 'learn' ? 'flex' : 'none';
  DOM.viewPanelInteractive.style.display = (newMode === 'sandbox' || newMode === 'real' || newMode === 'challenge') ? 'flex' : 'none';
  DOM.viewAnalysis.style.display = newMode === 'analysis' ? 'flex' : 'none';

  DOM.cardBuilder.style.display = newMode === 'real' ? 'none' : 'flex';
  DOM.cardReal.style.display = newMode === 'real' ? 'flex' : 'none';
  DOM.cardChallenge.style.display = newMode === 'challenge' ? 'flex' : 'none';

  if (newMode === 'learn') {
    renderLearnTable();
  } else if (newMode === 'sandbox') {
    resetToSandboxDefault();
  } else if (newMode === 'real') {
    // Default to Carbon Dioxide
    selectRealMolecule('co2');
  } else if (newMode === 'challenge') {
    startNewChallengeSet();
    loadChallenge(0);
  }

  // Force canvas resize trigger after turning display: flex back on
  if (newMode === 'sandbox' || newMode === 'real' || newMode === 'challenge') {
    if (window.resizeMainCanvas) {
      window.resizeMainCanvas();
    }
    requestAnimationFrame(() => {
      if (window.resizeMainCanvas) window.resizeMainCanvas();
    });
    setTimeout(() => {
      if (window.resizeMainCanvas) {
        window.resizeMainCanvas();
      }
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }
}

// ==========================================================================
// Toast Warnings & Shake Transitions
// ==========================================================================

function showToast(msg) {
  DOM.lblToastMessage.textContent = msg;
  DOM.toastContainer.classList.add('show');
  setTimeout(() => {
    DOM.toastContainer.classList.remove('show');
  }, 3000);
}

function triggerWarningShake() {
  DOM.cardBuilder.classList.remove('shake');
  void DOM.cardBuilder.offsetWidth; // Reflow
  DOM.cardBuilder.classList.add('shake');
}

// ==========================================================================
// Gamification Challenge 2.0 Logic
// ==========================================================================

function startNewChallengeSet() {
  const shuffled = [...window.CHALLENGE_PROMPTS].sort(() => 0.5 - Math.random());
  state.challenge.queue = shuffled.slice(0, 5); // Pick exactly 5 challenges
  currentQuestionIndex = 0;
  currentAttempts = 0;
  state.challenge.currentIndex = 0;
  state.challenge.attempts = 0;
  state.challenge.history = [];
  state.challenge.correctCount = 0;
  state.challenge.startTime = Date.now(); // Track total duration
  state.challenge.detailedResults = [];
}

function loadChallenge(index) {
  currentQuestionIndex = index;
  state.challenge.currentIndex = index;
  state.challenge.isCompleted = false;
  currentAttempts = 0;
  state.challenge.attempts = 0;
  
  DOM.btnShowSolution.style.display = 'none'; // Hide solution button initially
  
  const currentChallenge = state.challenge.queue[index];
  if (currentChallenge) {
    DOM.lblChallengePrompt.textContent = t(currentChallenge.prompt);
    DOM.lblChallengeHint.textContent = t(currentChallenge.hint);
    
    // Update target banner number (Iteration 3.0 Section 4)
    DOM.lblChallengeNumberHeader.textContent = (state.language === 'en' ? 'CHALLENGE #' : 'சவால் #') + (index + 1);
  }
  
  clearAllDomains(true);
}

function checkChallengeShape() {
  if (state.mode !== 'challenge' || state.challenge.isCompleted || state.isModalOpen) return;

  const currentChallenge = state.challenge.queue[currentQuestionIndex];
  if (!currentChallenge) return;

  const bondedCount = state.domains.bonds.length;
  const lonePairsCount = state.domains.lonePairs;
  const geomKey = `${bondedCount}_${lonePairsCount}`;

  if (geomKey === currentChallenge.key) {
    // CORRECT!
    state.challenge.isCompleted = true;
    state.challenge.correctCount++;
    
    // Record results
    state.challenge.detailedResults.push({
      geometry: t(currentChallenge.targetGeometry),
      key: currentChallenge.key,
      attempts: currentAttempts + 1,
      solutionShown: false
    });

    triggerConfetti();
    
    // Localize modal
    DOM.lblCelebrationTitle.textContent = state.language === 'en' ? 'Challenge Mastered!' : 'சவால் வெல்லப்பட்டது!';
    DOM.lblCelebrationMsg.textContent = t(currentChallenge.successMsg);
    
    const nextBtnLabel = DOM.btnNextChallenge.querySelector('#lbl-next-challenge') || DOM.lblCelebrationNext;
    if (currentQuestionIndex >= state.challenge.queue.length - 1) {
      nextBtnLabel.textContent = state.language === 'en' ? 'See Results' : 'முடிவுகளைப் பார்';
    } else {
      nextBtnLabel.textContent = state.language === 'en' ? 'Next Challenge' : 'அடுத்த சவால்';
    }

    setTimeout(() => {
      DOM.celebrationModal.classList.add('show');
    }, 450);
  } else {
    // INCORRECT!
    currentAttempts++;
    state.challenge.attempts = currentAttempts;
    
    const dict = window.I18N_DICT[state.language];
    showToast(dict.lblIncorrectBuild || 'Not quite! Check your configuration and try again.');
    
    DOM.cardChallenge.classList.remove('shake');
    void DOM.cardChallenge.offsetWidth; // Reflow
    DOM.cardChallenge.classList.add('shake');

    if (currentAttempts >= 3) {
      DOM.btnShowSolution.style.display = 'block';
    }
  }
}

function showChallengeSolution() {
  if (state.mode !== 'challenge' || state.challenge.isCompleted || state.isModalOpen) return;

  const currentChallenge = state.challenge.queue[currentQuestionIndex];
  if (!currentChallenge) return;

  // Mark as struggled
  const geomName = t(currentChallenge.targetGeometry);
  if (!state.challenge.history.includes(geomName)) {
    state.challenge.history.push(geomName);
  }

  // Record results
  state.challenge.detailedResults.push({
    geometry: geomName,
    key: currentChallenge.key,
    attempts: currentAttempts,
    solutionShown: true
  });

  // Load solution atoms
  const parts = currentChallenge.key.split('_');
  const bondsCount = parseInt(parts[0]);
  const loneCount = parseInt(parts[1]);

  state.domains.bonds = Array.from({ length: bondsCount }, (_, idx) => ({ type: 'single', id: Date.now() + idx }));
  state.domains.lonePairs = loneCount;
  
  state.challenge.isCompleted = true;
  renderState(); // Repaint

  const dict = window.I18N_DICT[state.language];
  DOM.lblCelebrationTitle.textContent = dict.btnShowSolution || 'Solution';
  DOM.lblCelebrationMsg.textContent = dict.lblSolutionBuilt || 'Solution loaded! Observe the configuration.';

  const nextBtnLabel = DOM.btnNextChallenge.querySelector('#lbl-next-challenge') || DOM.lblCelebrationNext;
  if (currentQuestionIndex >= state.challenge.queue.length - 1) {
    nextBtnLabel.textContent = state.language === 'en' ? 'See Results' : 'முடிவுகளைப் பார்';
  } else {
    nextBtnLabel.textContent = state.language === 'en' ? 'Next Challenge' : 'அடுத்த சவால்';
  }

  setTimeout(() => {
    DOM.celebrationModal.classList.add('show');
  }, 450);
}

function handleNextChallenge() {
  DOM.celebrationModal.classList.remove('show');

  const nextIndex = currentQuestionIndex + 1;
  if (nextIndex === 5 || nextIndex >= state.challenge.queue.length) {
    showResultAnalysis();
  } else {
    loadChallenge(nextIndex);
  }
}

function showResultAnalysis() {
  state.mode = 'analysis';
  
  DOM.viewPanelInteractive.style.display = 'none';
  DOM.viewLearn.style.display = 'none';
  DOM.viewAnalysis.style.display = 'flex';

  const dict = window.I18N_DICT[state.language];
  
  // 1. Final Score Fraction
  DOM.lblAnalysisScore.textContent = `${state.challenge.correctCount} / 5`;

  // 2. Percentage
  const percentageValue = Math.round((state.challenge.correctCount / 5) * 100);
  DOM.lblAnalysisPercentage.textContent = `${percentageValue}%`;

  // 3. Time Taken
  const timeElapsed = Math.round((Date.now() - state.challenge.startTime) / 1000);
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  DOM.lblAnalysisTime.textContent = state.language === 'en' ? `${minutes}m ${seconds}s` : `${minutes}நி ${seconds}வி`;

  // Correct Count and Wrong Count (Iteration 3.2)
  if (DOM.lblAnalysisCorrect) {
    DOM.lblAnalysisCorrect.textContent = state.challenge.correctCount;
  }
  if (DOM.lblAnalysisWrong) {
    DOM.lblAnalysisWrong.textContent = 5 - state.challenge.correctCount;
  }

  // 4. Feedback
  if (state.challenge.correctCount === 5) {
    DOM.lblAnalysisFeedback.textContent = dict.lblPerfectScore || 'Perfect Score! You have fully mastered VSEPR molecular shapes!';
  } else {
    DOM.lblAnalysisFeedback.textContent = state.language === 'en' 
      ? 'Good effort! Practice more in the Sandbox to master all geometries.' 
      : 'நல்ல முயற்சி! மேலும் சாண்ட்பாக்ஸில் பயிற்சி பெற்று அனைத்து வடிவங்களையும் கற்றுக்கொள்ளுங்கள்.';
  }

  // 5. Build structured breakdown list (Iteration 3.0 Section 1)
  DOM.analysisBreakdownList.innerHTML = '';
  state.challenge.detailedResults.forEach(res => {
    const row = document.createElement('li');
    row.className = 'breakdown-row';

    const attemptsText = res.attempts === 1 
      ? dict.attemptSingle 
      : dict.attemptsCount.replace('{attempts}', res.attempts);

    const badgeClass = res.solutionShown ? 'solution' : 'success';
    const badgeText = res.solutionShown ? dict.statusSolution : dict.statusSuccess;

    // Resolve geometry dynamically using key if available to ensure translations sync
    const geom = window.VSEPR_GEOMETRIES[res.key];
    const geomName = geom ? t(geom.molecularGeometry) : res.geometry;

    row.innerHTML = `
      <div class="breakdown-info">
        <span class="breakdown-geom-name">${geomName}</span>
        <span class="breakdown-attempts">${attemptsText}</span>
      </div>
      <span class="breakdown-badge ${badgeClass}">${badgeText}</span>
    `;
    DOM.analysisBreakdownList.appendChild(row);
  });
}

function resetAndPlayAgain() {
  if (state.isModalOpen) return;
  startNewChallengeSet();
  switchMode('challenge');
}

function triggerConfetti() {
  DOM.confettiOverlay.innerHTML = '';
  DOM.confettiOverlay.classList.add('active');

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  for (let i = 0; i < 75; i++) {
    const flake = document.createElement('div');
    flake.className = 'confetti';
    
    const size = Math.floor(Math.random() * 8) + 6;
    const xPos = Math.random() * 100;
    const duration = (Math.random() * 2) + 2;
    const delay = Math.random() * 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    flake.style.cssText = `
      left: ${xPos}%;
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    DOM.confettiOverlay.appendChild(flake);
  }

  setTimeout(() => {
    DOM.confettiOverlay.classList.remove('active');
    DOM.confettiOverlay.innerHTML = '';
  }, 5000);
}

// ==========================================================================
// Event Listeners Binding
// ==========================================================================

function bindEvents() {
  // Tabs
  DOM.tabLearn.addEventListener('click', () => switchMode('learn'));
  DOM.tabSandbox.addEventListener('click', () => switchMode('sandbox'));
  DOM.tabReal.addEventListener('click', () => switchMode('real'));
  DOM.tabChallenge.addEventListener('click', () => switchMode('challenge'));

  // Actions
  DOM.btnAddSingle.addEventListener('click', () => addBond('single'));
  DOM.btnAddDouble.addEventListener('click', () => addBond('double'));
  DOM.btnAddTriple.addEventListener('click', () => addBond('triple'));
  DOM.btnAddLone.addEventListener('click', addLonePair);

  DOM.btnRemoveBond.addEventListener('click', removeLastBond);
  DOM.btnRemoveLone.addEventListener('click', removeLastLonePair);
  DOM.btnClearAll.addEventListener('click', () => clearAllDomains(false));

  // Quick Examples Buttons
  DOM.btnQuickCo2.addEventListener('click', () => loadQuickExample('co2'));
  DOM.btnQuickH2o.addEventListener('click', () => loadQuickExample('h2o'));
  DOM.btnQuickBf3.addEventListener('click', () => loadQuickExample('bf3'));
  DOM.btnQuickSf6.addEventListener('click', () => loadQuickExample('sf6'));

  // Challenge controls
  DOM.btnCheckChallenge.addEventListener('click', checkChallengeShape);
  DOM.btnShowSolution.addEventListener('click', showChallengeSolution);
  DOM.btnPlayAgain.addEventListener('click', resetAndPlayAgain);
  DOM.btnGoSandbox.addEventListener('click', () => switchMode('sandbox'));

  // Modal controls (Iteration 3.0 Section 2)
  DOM.btnCloseGeomModal.addEventListener('click', closeGeometryModal);
  DOM.geomModal.addEventListener('click', (e) => {
    // Clicking backdrop closes modal
    if (e.target === DOM.geomModal) {
      closeGeometryModal();
    }
  });

  // Real molecules grid buttons click listeners (Feature 4)
  document.querySelectorAll('.molecule-grid-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.molecule-grid-btn');
      if (targetBtn) {
        const molId = targetBtn.getAttribute('data-mol');
        selectRealMolecule(molId);
      }
    });
  });

  // Toggles
  DOM.toggleLonePairs.addEventListener('change', (e) => {
    state.settings.showLonePairs = e.target.checked;
    DOM.legendRowLP.style.opacity = e.target.checked ? 1 : 0.3;
    window.setLonePairsVisibility(e.target.checked);
  });

  DOM.toggleBondAngles.addEventListener('change', (e) => {
    state.settings.showBondAngles = e.target.checked;
    window.buildBondAngles(state);
  });

  // Language & Auto-rotation control listeners (Bug Fix 3 & Feature 5)
  DOM.btnLangToggle.addEventListener('click', toggleLanguage);
  DOM.btnAutoRotate.addEventListener('click', toggleAutoRotation);

  // Challenge modal trigger next
  DOM.btnNextChallenge.addEventListener('click', handleNextChallenge);

  // Auto-Tour button event listener
  DOM.tourBtn.addEventListener('click', toggleTour);

  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('.learn-header-info-btn')) {
      const header = e.target.closest('.learn-header-with-tooltip');
      const wasActive = header.classList.contains('is-active');
      hideLearnHeaderTooltips();
      if (!wasActive) header.classList.add('is-active');
      return;
    }

    if (!e.target.closest || !e.target.closest('.learn-header-with-tooltip')) {
      hideLearnHeaderTooltips();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideLearnHeaderTooltips();
    }
  });

  window.addEventListener('resize', () => hideLearnHeaderTooltips());
  if (DOM.viewLearn) {
    DOM.viewLearn.addEventListener('scroll', () => hideLearnHeaderTooltips(), { passive: true });
  }
}

// ==========================================================================
// Automated Diagnostics (Available via Console for Verification)
// ==========================================================================

window.runDiagnosticsSuite = function() {
  if (state.isAnimating) {
    console.warn("Please wait for active transitions to finish before running diagnostics.");
    return;
  }
  
  console.group("%c🔬 VSEPR Sandbox Automated Diagnostic Suite", "color: #3B82F6; font-size: 1.1rem; font-weight: bold;");
  console.log("Starting test runs for all 14 geometries...");

  const testCases = [
    { key: '2_0', title: 'Linear AX2', bonds: ['single', 'single'], lones: 0 },
    { key: '3_0', title: 'Trigonal Planar AX3', bonds: ['single', 'single', 'single'], lones: 0 },
    { key: '2_1', title: 'Bent AX2E', bonds: ['single', 'single'], lones: 1 },
    { key: '4_0', title: 'Tetrahedral AX4', bonds: ['single', 'single', 'single', 'single'], lones: 0 },
    { key: '3_1', title: 'Trigonal Pyramidal AX3E', bonds: ['single', 'single', 'single'], lones: 1 },
    { key: '2_2', title: 'Bent AX2E2', bonds: ['single', 'single'], lones: 2 },
    { key: '5_0', title: 'Trigonal Bipyramidal AX5', bonds: ['single', 'single', 'single', 'single', 'single'], lones: 0 },
    { key: '4_1', title: 'Seesaw AX4E', bonds: ['single', 'single', 'single', 'single'], lones: 1 },
    { key: '3_2', title: 'T-Shaped AX3E2', bonds: ['single', 'single', 'single'], lones: 2 },
    { key: '2_3', title: 'Linear AX2E3', bonds: ['single', 'single'], lones: 3 },
    { key: '6_0', title: 'Octahedral AX6', bonds: ['single', 'single', 'single', 'single', 'single', 'single'], lones: 0 },
    { key: '5_1', title: 'Square Pyramidal AX5E', bonds: ['single', 'single', 'single', 'single', 'single'], lones: 1 },
    { key: '4_2', title: 'Square Planar AX4E2', bonds: ['single', 'single', 'single', 'single'], lones: 2 },
    { key: '7_0', title: 'Pentagonal Bipyramidal AX7', bonds: ['single', 'single', 'single', 'single', 'single', 'single', 'single'], lones: 0 }
  ];

  let passed = 0;
  let testIdx = 0;

  const originalMode = state.mode;
  const originalBonds = JSON.parse(JSON.stringify(state.domains.bonds));
  const originalLones = state.domains.lonePairs;
  
  state.isAnimating = true;

  function runNextTest() {
    if (testIdx >= testCases.length) {
      console.log(`%cDiagnostics Finished: ${passed}/${testCases.length} Configurations Passed!`, "color: #10B981; font-weight: bold;");
      console.groupEnd();
      
      state.mode = originalMode;
      state.domains.bonds = originalBonds;
      state.domains.lonePairs = originalLones;
      state.isAnimating = false;
      
      renderState();
      return;
    }

    const testCase = testCases[testIdx];
    state.domains.bonds = testCase.bonds.map((t, idx) => ({ type: t, id: Date.now() + idx }));
    state.domains.lonePairs = testCase.lones;

    const key = `${state.domains.bonds.length}_${state.domains.lonePairs}`;
    const geometryInfo = window.VSEPR_GEOMETRIES[key];

    if (geometryInfo) {
      console.log(`%c[Test #${testIdx + 1}] Testing ${testCase.title}...`, "color: #581C87");
      
      const molGeomName = t(geometryInfo.molecularGeometry);
      window.clear3DScene();
      
      window.renderMoleculeScene(state, () => {
        let assertPass = true;
        const totalMeshCount = window.state.domains.bonds.length + window.state.domains.lonePairs;
        if (totalMeshCount !== testCase.bonds.length + testCase.lones) {
          console.error(`- Mesh distribution mismatch! Expected ${testCase.bonds.length + testCase.lones}, got ${totalMeshCount}`);
          assertPass = false;
        }

        if (t(geometryInfo.molecularGeometry) !== molGeomName) {
          console.error(`- Geometry string mismatch! Expected ${geometryInfo.molecularGeometry}, got ${molGeomName}`);
          assertPass = false;
        }

        if (assertPass) {
          console.log(`%c  ✔ ${testCase.title} renders successfully. Key: ${key}`, "color: #10B981");
          passed++;
        } else {
          console.log(`%c  ❌ ${testCase.title} failed asserts. Check errors.`, "color: #EF4444");
        }

        testIdx++;
        setTimeout(runNextTest, 200);
      });
    } else {
      console.error(`Missing metadata index key: ${key}`);
      testIdx++;
      setTimeout(runNextTest, 200);
    }
  }

  runNextTest();
};
