/**
 * moleculeData.js
 * 
 * VSEPR Geometries (2 to 7 electron domains), ideal bond angles, 
 * real-molecule configurations, CPK color hex codes, Challenge Mode definitions,
 * and comprehensive English/Tamil (தமிழ்) translation dictionaries.
 */

// Upgraded CPK standard hex colors for atoms (Section 2)
const CPK_COLORS = {
  'H': '#FFFFFF',  // Hydrogen (White)
  'C': '#222222',  // Carbon (Dark Grey)
  'O': '#FF0D0D',  // Oxygen (Red)
  'N': '#3050F8',  // Nitrogen (Blue)
  'F': '#90E050',  // Fluorine (Light Green)
  'S': '#E6E600',  // Sulfur (Yellow)
  'Cl': '#1FF01F', // Chlorine (Green)
  'P': '#FF8000',  // Phosphorus (Orange)
  'B': '#FFB5B5',  // Boron (Salmon Pink)
  'Xe': '#4D9FF3', // Xenon (Cyan-Blue)
  'Be': '#808080', // Beryllium (Medium Grey)
  'Default': '#8E9AA6', // Default Central Atom (Light Grayish-Blue)
  'Generic': '#60A5FA'  // Generic Outer Atom (Light Blue)
};

// VSEPR Geometries mapping
// Key format: `${bondedDomains}_${lonePairs}`
// Values are bilingual objects resolving { en: '...', ta: '...' }
const VSEPR_GEOMETRIES = {
  // 1 Domain (trivial, linear)
  '1_0': {
    electronGeometry: { en: 'Linear', ta: 'நேரியல்' },
    molecularGeometry: { en: 'Linear', ta: 'நேரியல்' },
    idealAngle: 'N/A',
    description: { 
      en: 'A simple diatomic molecule consisting of two atoms. With only one bond, there is no bond angle to measure.', 
      ta: 'இரண்டு அணுக்களைக் கொண்ட ஒரு எளிய இருஅணு மூலக்கூறு. ஒரே ஒரு பிணைப்பு மட்டுமே இருப்பதால், அளவிடுவதற்கு பிணைப்புக் கோணம் ஏதும் இல்லை.' 
    },
    rule: { 
      en: 'Diatomic molecules are always linear. No angle is formed with a single bond.', 
      ta: 'இருஅணு மூலக்கூறுகள் எப்போதுமே நேரியல் வடிவத்தில் இருக்கும். ஒற்றை பிணைப்பில் கோணம் எதுவும் உருவாவதில்லை.' 
    }
  },
  '1_1': {
    electronGeometry: { en: 'Linear', ta: 'நேரியல்' },
    molecularGeometry: { en: 'Linear', ta: 'நேரியல்' },
    idealAngle: 'N/A',
    description: { 
      en: 'A central atom with one bonded atom and one lone pair. The electron domains lie on opposite sides.', 
      ta: 'ஒரு பிணைக்கப்பட்ட அணுவும் ஒரு தனித்த ஜோடியும் கொண்ட ஒரு மைய அணு. எலக்ட்ரான் டொமைன்கள் எதிர் எதிர் பக்கங்களில் அமைந்துள்ளன.' 
    },
    rule: { 
      en: 'Diatomic with lone pair. Shape is linear.', 
      ta: 'தனித்த ஜோடியுடன் கூடிய இருஅணு வடிவம். வடிவம் நேரியல் ஆகும்.' 
    }
  },
  '1_2': {
    electronGeometry: { en: 'Trigonal Planar', ta: 'முக்கோண சமதளம்' },
    molecularGeometry: { en: 'Linear', ta: 'நேரியல்' },
    idealAngle: 'N/A',
    description: { 
      en: 'A central atom with one bonded atom and two lone pairs. The three domains lie in a plane.', 
      ta: 'ஒரு பிணைக்கப்பட்ட அணுவும் இரண்டு தனித்த ஜோடிகளும் கொண்ட ஒரு மைய அணு. மூன்று டொமைன்களும் ஒரு சமதளத்தில் அமைந்துள்ளன.' 
    },
    rule: { 
      en: 'Diatomic with two lone pairs. Shape is linear.', 
      ta: 'இரண்டு தனித்த ஜோடிகளுடன் கூடிய இருஅணு வடிவம். வடிவம் நேரியல் ஆகும்.' 
    }
  },
  '1_3': {
    electronGeometry: { en: 'Tetrahedral', ta: 'நான்முகி' },
    molecularGeometry: { en: 'Linear', ta: 'நேரியல்' },
    idealAngle: 'N/A',
    description: { 
      en: 'A central atom with one bonded atom and three lone pairs. The four domains arrange tetrahedrally.', 
      ta: 'ஒரு பிணைக்கப்பட்ட அணுவும் மூன்று தனித்த ஜோடிகளும் கொண்ட ஒரு மைய அணு. நான்கு டொமைன்களும் நான்முகி வடிவில் அமைந்துள்ளன.' 
    },
    rule: { 
      en: 'Diatomic with three lone pairs. Shape is linear.', 
      ta: 'மூன்று தனித்த ஜோடிகளுடன் கூடிய இருஅணு வடிவம். வடிவம் நேரியல் ஆகும்.' 
    }
  },

  // 2 Domains
  '2_0': {
    electronGeometry: { en: 'Linear', ta: 'நேரியல்' },
    molecularGeometry: { en: 'Linear', ta: 'நேரியல்' },
    idealAngle: '180°',
    description: { 
      en: 'Two bonded atoms placed symmetrically on opposite sides of the central atom. With zero lone pairs, the repulsions are balanced perfectly, creating a straight molecule.', 
      ta: 'மைய அணுவின் எதிர் எதிர் பக்கங்களில் சமச்சீராக வைக்கப்பட்ட இரண்டு பிணைக்கப்பட்ட அணுக்கள். தனித்த ஜோடிகள் இல்லாததால், விலக்க விசைகள் கச்சிதமாக சமப்படுத்தப்பட்டு நேர் மூலக்கூறை உருவாக்குகின்றன.' 
    },
    rule: { 
      en: 'With 2 electron domains and no lone pairs, the domains repel each other to opposite sides (180°).', 
      ta: '2 எலக்ட்ரான் டொமைன்கள் மற்றும் தனித்த ஜோடிகள் இல்லாத நிலையில், டொமைன்கள் எதிர் எதிர் பக்கங்களுக்கு விலகிச் செல்கின்றன (180°).' 
    }
  },

  // 3 Domains
  '3_0': {
    electronGeometry: { en: 'Trigonal Planar', ta: 'முக்கோண சமதளம்' },
    molecularGeometry: { en: 'Trigonal Planar', ta: 'முக்கோண சமதளம்' },
    idealAngle: '120°',
    description: { 
      en: 'Three bonded atoms arranged in a flat, equilateral triangle around the central atom. The domains are spread out in a single plane at equal angles.', 
      ta: 'மைய அணுவைச் சுற்றி ஒரு தட்டையான, சமபக்க முக்கோண வடிவில் அமைக்கப்பட்ட மூன்று பிணைக்கப்பட்ட அணுக்கள். டொமைன்கள் சமமான கோணங்களில் ஒரே சமதளத்தில் பரவியுள்ளன.' 
    },
    rule: { 
      en: 'Three electron domains, all bonding, create a flat triangle with angles of exactly 120°.', 
      ta: 'மூன்று எலக்ட்ரான் டொமைன்களும் பிணைப்பில் ஈடுபடும்போது, சரியாக 120° கோணங்களைக் கொண்ட ஒரு தட்டையான முக்கோணத்தை உருவாக்குகின்றன.' 
    }
  },
  '2_1': {
    electronGeometry: { en: 'Trigonal Planar', ta: 'முக்கோண சமதளம்' },
    molecularGeometry: { en: 'Bent', ta: 'வளைந்த' },
    idealAngle: '120°',
    realAngleOverride: '119°',
    description: { 
      en: 'Based on trigonal planar geometry, but one position is occupied by a lone pair. The lone pair is "invisible" in the molecular shape, but its high electron density pushes the two bonds closer together, compressing the angle slightly below 120°.', 
      ta: 'முக்கோண சமதள வடிவவியலை அடிப்படையாகக் கொண்டது, ஆனால் ஒரு இடத்தை ஒரு தனித்த ஜோடி ஆக்கிரமித்துள்ளது. மூலக்கூறு வடிவத்தில் தனித்த ஜோடி "தெரியாது", ஆனால் அதன் அதிக எலக்ட்ரான் அடர்த்தி இரண்டு பிணைப்புகளையும் நெருக்கமாக தள்ளி, கோணத்தை 120°-க்குக் கீழே சுருக்குகிறது.' 
    },
    rule: { 
      en: 'A lone pair repels bonding pairs more than they repel each other. This pushes the bonds together, reducing the angle to ~119°.', 
      ta: 'ஒரு தனித்த ஜோடி பிணைப்பு ஜோடிகளை விட அதிகமாக விலக்குகிறது. இது பிணைப்புகளை ஒன்றாகத் தள்ளி, கோணத்தை ~119° ஆகக் குறைக்கிறது.' 
    }
  },

  // 4 Domains
  '4_0': {
    electronGeometry: { en: 'Tetrahedral', ta: 'நான்முகி' },
    molecularGeometry: { en: 'Tetrahedral', ta: 'நான்முகி' },
    idealAngle: '109.5°',
    description: { 
      en: 'Four bonded atoms arranged at the four corners of a tetrahedron (a 3D pyramid with a triangular base). This symmetry balances all repulsions in three dimensions, resulting in the famous tetrahedral angle of 109.5°.', 
      ta: 'ஒரு நான்முகியின் நான்கு மூலைகளில் அமைக்கப்பட்ட நான்கு பிணைக்கப்பட்ட அணுக்கள் (முக்கோண அடிப்பகுதியைக் கொண்ட ஒரு முப்பரிமாண கூம்பு). இந்த சமச்சீர்நிலை முப்பரிமாணத்திலும் அனைத்து விலக்கங்களையும் சமன் செய்து, 109.5° நான்முகி கோணத்தை உருவாக்குகிறது.' 
    },
    rule: { 
      en: 'Four electron domains with no lone pairs form a 3D tetrahedron. The ideal bond angle is exactly 109.5°.', 
      ta: 'தனித்த ஜோடிகள் இல்லாத நான்கு எலக்ட்ரான் டொமைன்கள் ஒரு முப்பரிமாண நான்முகியை உருவாக்குகின்றன. இதன் சிறந்த பிணைப்புக் கோணம் சரியாக 109.5° ஆகும்.' 
    }
  },
  '3_1': {
    electronGeometry: { en: 'Tetrahedral', ta: 'நான்முகி' },
    molecularGeometry: { en: 'Trigonal Pyramidal', ta: 'முக்கோண கூம்பு' },
    idealAngle: '109.5°',
    realAngleOverride: '107°',
    description: { 
      en: 'Derived from tetrahedral geometry with one lone pair. The lone pair sits at the top apex and strongly repels the three bonded atoms below it, compressing their bond angles down to approximately 107°.', 
      ta: 'ஒரு தனித்த ஜோடியுடன் நான்முகி வடிவவியலில் இருந்து பெறப்பட்டது. தனித்த ஜோடி மேல் உச்சியில் அமர்ந்து அதற்குக் கீழே உள்ள மூன்று பிணைக்கப்பட்ட அணுக்களை வலுவாக விலக்குகிறது, இதனால் அவற்றின் பிணைப்புக் கோணங்கள் தோராயமாக 107° ஆகக் குறைகின்றன.' 
    },
    rule: { 
      en: 'One lone pair compresses the tetrahedral angle from 109.5° down to about 107°, lifting the central atom above the base.', 
      ta: 'ஒரு தனித்த ஜோடி நான்முகி கோணத்தை 109.5°-லிருந்து 107° ஆகக் குறைத்து, மைய அணுவை அடிப்பகுதிக்கு மேலே உயர்த்துகிறது.' 
    }
  },
  '2_2': {
    electronGeometry: { en: 'Tetrahedral', ta: 'நான்முகி' },
    molecularGeometry: { en: 'Bent', ta: 'வளைந்த' },
    idealAngle: '109.5°',
    realAngleOverride: '104.5°',
    description: { 
      en: 'Derived from tetrahedral geometry with two lone pairs. The two lone pairs exert extreme repulsion against the bonds and each other, compressing the remaining bond angle significantly down to 104.5° (as seen in water).', 
      ta: 'இரண்டு தனித்த ஜோடிகளுடன் நான்முகி வடிவவியலில் இருந்து பெறப்பட்டது. இரண்டு தனித்த ஜோடிகளும் பிணைப்புகளுக்கும் தங்களுக்குள்ளும் கடுமையான விலக்கத்தை ஏற்படுத்தி, மீதமுள்ள பிணைப்புக் கோணத்தை 104.5° ஆகக் குறைக்கின்றன (நீரில் காணப்படுவது போல).' 
    },
    rule: { 
      en: 'Two lone pairs repel even more strongly, compressing the bond angle down from 109.5° to ~104.5°.', 
      ta: 'இரண்டு தனித்த ஜோடிகள் இன்னும் வலுவாக விலக்கி, பிணைப்புக் கோணத்தை 109.5°-லிருந்து ~104.5° ஆகக் குறைக்கின்றன.' 
    }
  },

  // 5 Domains
  '5_0': {
    electronGeometry: { en: 'Trigonal Bipyramidal', ta: 'முக்கோண இருகூம்பு' },
    molecularGeometry: { en: 'Trigonal Bipyramidal', ta: 'முக்கோண இருகூம்பு' },
    idealAngle: '90° & 120°',
    description: { 
      en: 'Five bonded atoms. Three sit in an equatorial plane at 120° angles from each other. Two sit in axial positions pointing straight up and down, forming a 90° angle with the equatorial plane. This is the first shape with two distinct bond angles!', 
      ta: 'ஐந்து பிணைக்கப்பட்ட அணுக்கள். மூன்று அணுக்கள் மத்திய சமதளத்தில் ஒன்றுக்கொன்று 120° கோணத்தில் அமைந்துள்ளன. இரண்டு அணுக்கள் செங்குத்தாக மேல் மற்றும் கீழ் நோக்கி அமைந்து, மத்திய சமதளத்துடன் 90° கோணத்தை உருவாக்குகின்றன. இரண்டு வெவ்வேறு பிணைப்புக் கோணங்களைக் கொண்ட முதல் வடிவம் இதுவாகும்!' 
    },
    rule: { 
      en: 'Three equatorial atoms lie in a plane (120° apart). Two axial atoms stand perpendicular to the plane (90° from equatorial).', 
      ta: 'மூன்று மத்திய அணுக்கள் ஒரு சமதளத்தில் அமைந்துள்ளன (120° இடைவெளியில்). இரண்டு செங்குத்து அணுக்கள் சமதளத்திற்கு நேராக நிற்கின்றன (மத்திய சமதளத்திலிருந்து 90°).' 
    }
  },
  '4_1': {
    electronGeometry: { en: 'Trigonal Bipyramidal', ta: 'முக்கோண இருகூம்பு' },
    molecularGeometry: { en: 'Seesaw', ta: 'ஊஞ்சல் வடிவம்' },
    idealAngle: '90° & 120°',
    realAngleOverride: '90° & 120° (Distorted)',
    description: { 
      en: 'Derived from trigonal bipyramidal geometry with one lone pair. The lone pair prefers the equatorial position (where it has only two 90° interactions) rather than axial. It pushes the other bonds, creating a seesaw-like appearance.', 
      ta: 'ஒரு தனித்த ஜோடியுடன் முக்கோண இருகூம்பு வடிவவியலில் இருந்து பெறப்பட்டது. தனித்த ஜோடி செங்குத்து நிலையை விட மத்திய நிலையையே விரும்புகிறது (அங்கு அதற்கு இரண்டு 90° விலக்கங்கள் மட்டுமே உள்ளன). இது மற்ற பிணைப்புகளைத் தள்ளி, ஒரு சீசா (ஊஞ்சல்) போன்ற தோற்றத்தை உருவாக்குகிறது.' 
    },
    rule: { 
      en: 'In 5-domain systems, lone pairs ALWAYS prefer equatorial positions to minimize 90° repulsions. This results in a seesaw shape.', 
      ta: '5-டொமைன் அமைப்புகளில், 90° விலக்கங்களைக் குறைக்க தனித்த ஜோடிகள் எப்போதும் மத்திய நிலையையே விரும்புகின்றன. இது சீசா வடிவத்தை உருவாக்குகிறது.' 
    }
  },
  '3_2': {
    electronGeometry: { en: 'Trigonal Bipyramidal', ta: 'முக்கோண இருகூம்பு' },
    molecularGeometry: { en: 'T-Shaped', ta: 'டி-வடிவம்' },
    idealAngle: '90°',
    realAngleOverride: '87.5°',
    description: { 
      en: 'Derived from trigonal bipyramidal geometry with two lone pairs. Both lone pairs occupy equatorial positions, leaving two axial bonds and one equatorial bond in a flat layout resembling the letter T.', 
      ta: 'இரண்டு தனித்த ஜோடிகளுடன் முக்கோண இருகூம்பு வடிவவியலில் இருந்து பெறப்பட்டது. இரண்டு தனித்த ஜோடிகளும் மத்திய நிலைகளை ஆக்கிரமித்து, இரண்டு செங்குத்து பிணைப்புகளையும் ஒரு மத்திய பிணைப்பையும் மட்டுமே விட்டுச் செல்கின்றன, இது டி (T) எழுத்தைப் போன்ற தட்டையான அமைப்பை உருவாக்குகிறது.' 
    },
    rule: { 
      en: 'Two equatorial lone pairs compress the remaining axial-to-equatorial bonds, bending them slightly inward to ~87.5°.', 
      ta: 'இரண்டு மத்திய தனித்த ஜோடிகள் எஞ்சிய பிணைப்புகளை அழுத்திக் கோணத்தை ~87.5° ஆகக் குறைக்கின்றன.' 
    }
  },
  '2_3': {
    electronGeometry: { en: 'Trigonal Bipyramidal', ta: 'முக்கோண இருகூம்பு' },
    molecularGeometry: { en: 'Linear', ta: 'நேரியல்' },
    idealAngle: '180°',
    description: { 
      en: 'Derived from trigonal bipyramidal geometry with three lone pairs. All three equatorial positions are occupied by lone pairs, which cancel each other\'s repulsions in a symmetric ring. The remaining two axial bonds form a perfectly straight line.', 
      ta: 'மூன்று தனித்த ஜோடிகளுடன் முக்கோண இருகூம்பு வடிவவியலில் இருந்து பெறப்பட்டது. மூன்று மத்திய நிலைகளும் தனித்த ஜோடிகளால் ஆக்கிரமிக்கப்பட்டு, ஒரு சமச்சீர் வட்டத்தில் ஒன்றையொன்று சமன் செய்கின்றன. எஞ்சிய இரண்டு செங்குத்து பிணைப்புகள் நேர்க்கோட்டை (180°) உருவாக்குகின்றன.' 
    },
    rule: { 
      en: 'Three equatorial lone pairs form a flat ring of repulsion. The two axial bonds are pushed into a straight line (180°).', 
      ta: 'மூன்று மத்திய தனித்த ஜோடிகள் ஒரு தட்டையான விலக்கு வளையத்தை உருவாக்குகின்றன. இரண்டு செங்குத்து பிணைப்புகள் நேர்க்கோட்டில் தள்ளப்படுகின்றன (180°).' 
    }
  },

  // 6 Domains
  '6_0': {
    electronGeometry: { en: 'Octahedral', ta: 'எண்முகி' },
    molecularGeometry: { en: 'Octahedral', ta: 'எண்முகி' },
    idealAngle: '90°',
    description: { 
      en: 'Six bonded atoms arranged at the six corners of an octahedron (two square pyramids joined base-to-base). All positions are completely symmetrical and form exact 90° angles with adjacent bonds.', 
      ta: 'ஒரு எண்முகியின் ஆறு மூலைகளில் அமைக்கப்பட்ட ஆறு பிணைக்கப்பட்ட அணுக்கள் (அடிப்பகுதிகள் இணைக்கப்பட்ட இரண்டு சதுர கூம்புகள்). அனைத்து நிலைகளும் முற்றிலும் சமச்சீரானவை மற்றும் பக்கத்து பிணைப்புகளுடன் சரியாக 90° கோணங்களை உருவாக்குகின்றன.' 
    },
    rule: { 
      en: 'Six electron domains with no lone pairs form a perfectly symmetrical octahedral shape. Every adjacent bond angle is 90°.', 
      ta: 'தனித்த ஜோடிகள் இல்லாத ஆறு எலக்ட்ரான் டொமைன்கள் முற்றிலும் சமச்சீரான எண்முகி வடிவத்தை உருவாக்குகின்றன. பக்கத்து பிணைப்புக் கோணங்கள் அனைத்தும் 90° ஆகும்.' 
    }
  },
  '5_1': {
    electronGeometry: { en: 'Octahedral', ta: 'எண்முகி' },
    molecularGeometry: { en: 'Square Pyramidal', ta: 'சதுர கூம்பு' },
    idealAngle: '90°',
    realAngleOverride: '84.8°',
    description: { 
      en: 'Derived from octahedral geometry with one lone pair. The lone pair occupies one of the axial positions, pushing the four equatorial bonds upward/away and forming a pyramid with a square base.', 
      ta: 'ஒரு தனித்த ஜோடியுடன் எண்முகி வடிவவியலில் இருந்து பெறப்பட்டது. தனித்த ஜோடி செங்குத்து நிலைகளில் ஒன்றை ஆக்கிரமித்து, நான்கு மத்திய பிணைப்புகளையும் மேல் நோக்கித் தள்ளி, சதுர அடிப்பகுதியைக் கொண்ட ஒரு கூம்பை உருவாக்குகிறது.' 
    },
    rule: { 
      en: 'One axial lone pair pushes the four square-base bonds slightly away, compressing the angles to ~85°.', 
      ta: 'ஒரு செங்குத்து தனித்த ஜோடி நான்கு சதுர-அடிப்படை பிணைப்புகளை சற்று விலக்கி, கோணங்களை ~85° ஆகச் சுருக்குகிறது.' 
    }
  },
  '4_2': {
    electronGeometry: { en: 'Octahedral', ta: 'எண்முகி' },
    molecularGeometry: { en: 'Square Planar', ta: 'சதுர சமதளம்' },
    idealAngle: '90°',
    description: { 
      en: 'Derived from octahedral geometry with two lone pairs. To minimize repulsion, the two lone pairs sit directly opposite each other in axial positions. Their repulsions cancel out, leaving the four bonded atoms in a flat, perfect square plane.', 
      ta: 'இரண்டு தனித்த ஜோடிகளுடன் எண்முகி வடிவவியலில் இருந்து பெறப்பட்டது. விலக்கத்தைக் குறைக்க, இரண்டு தனித்த ஜோடிகளும் செங்குத்து நிலைகளில் நேருக்கு நேராக அமைகின்றன. அவற்றின் விலக்கங்கள் பரஸ்பரம் சமமாகி, நான்கு பிணைக்கப்பட்ட அணுக்களை ஒரு தட்டையான சதுர சமதளத்தில் விட்டுவிடுகின்றன.' 
    },
    rule: { 
      en: 'Two lone pairs sit opposite each other (180° apart) to minimize repulsion. The four bonds lie flat in a square (90°).', 
      ta: 'விலக்கத்தைக் குறைக்க இரண்டு தனித்த ஜோடிகள் நேருக்கு நேராக (180° இடைவெளில்) அமைகின்றன. நான்கு பிணைப்புகள் சதுரமாக தட்டையாக அமைகின்றன (90°).' 
    }
  },

  // 7 Domains
  '7_0': {
    electronGeometry: { en: 'Pentagonal Bipyramidal', ta: 'ஐங்கோண இருகூம்பு' },
    molecularGeometry: { en: 'Pentagonal Bipyramidal', ta: 'ஐங்கோண இருகூம்பு' },
    idealAngle: '72° & 90°',
    description: { 
      en: 'Seven bonded atoms. Five equatorial bonds are arranged in a pentagon (72° apart) within a plane, while two axial bonds sit straight up and down, perpendicular to the pentagonal plane (90°). This is a rare, crowded geometry.', 
      ta: 'ஏழு பிணைக்கப்பட்ட அணுக்கள். ஐந்து மத்திய பிணைப்புகள் ஒரு சமதளத்தில் ஐங்கோண வடிவில் (72° இடைவெளியில்) அமைந்துள்ளன, அதே நேரத்தில் இரண்டு செங்குத்து பிணைப்புகள் ஐங்கோண தளத்திற்கு செங்குத்தாக (90°) நேராக மேலும் கீழும் அமைந்துள்ளன. இது ஒரு அரிய, நெருக்கமான வடிவவியலாகும்.' 
    },
    rule: { 
      en: 'Five equatorial bonds form a pentagonal ring (72°). Two axial bonds point up and down (90° from the plane).', 
      ta: 'ஐந்து மத்திய பிணைப்புகள் ஒரு ஐங்கோண வளையத்தை (72°) உருவாக்குகின்றன. இரண்டு செங்குத்து பிணைப்புகள் மேலும் கீழும் (தளத்திலிருந்து 90°) நீட்டுகின்றன.' 
    }
  },
  '6_1': {
    electronGeometry: { en: 'Pentagonal Bipyramidal', ta: 'ஐங்கோண இருகூம்பு' },
    molecularGeometry: { en: 'Pentagonal Pyramidal', ta: 'ஐங்கோண கூம்பு' },
    idealAngle: '72° & 90°',
    realAngleOverride: '72° & 90° (Distorted)',
    description: { 
      en: 'Derived from pentagonal bipyramidal geometry with one lone pair. The lone pair occupies an axial position, pushing the five equatorial bonds downward into a pentagonal pyramid shape.', 
      ta: 'ஒரு தனித்த ஜோடியுடன் ஐங்கோண இருகூம்பு வடிவவியலில் இருந்து பெறப்பட்டது. தனித்த ஜோடி செங்குத்து நிலையை ஆக்கிரமித்து, ஐந்து மத்திய பிணைப்புகளையும் கீழ் நோக்கித் தள்ளி ஒரு ஐங்கோண கூம்பு வடிவத்தை உருவாக்குகிறது.' 
    },
    rule: { 
      en: 'One lone pair in the axial position pushes the equatorial pentagonal ring downward.', 
      ta: 'செங்குத்து நிலையில் உள்ள ஒரு தனித்த ஜோடி மத்திய ஐங்கோண வளையத்தை கீழ் நோக்கித் தள்ளுகிறது.' 
    }
  },
  '5_2': {
    electronGeometry: { en: 'Pentagonal Bipyramidal', ta: 'ஐங்கோண இருகூம்பு' },
    molecularGeometry: { en: 'Pentagonal Planar', ta: 'ஐங்கோண சமதளம்' },
    idealAngle: '72°',
    description: { 
      en: 'Derived from pentagonal bipyramidal geometry with two lone pairs. Both lone pairs sit in axial positions opposite each other, leaving the five bonds in a flat pentagonal plane.', 
      ta: 'இரண்டு தனித்த ஜோடிகளுடன் ஐங்கோண இருகூம்பு வடிவவியலில் இருந்து பெறப்பட்டது. இரண்டு தனித்த ஜோடிகளும் நேருக்கு நேராக செங்குத்து நிலைகளில் அமைந்து, ஐந்து பிணைப்புகளை ஒரு தட்டையான ஐங்கோண சமதளத்தில் விட்டுவிடுகின்றன.' 
    },
    rule: { 
      en: 'Two axial lone pairs cancel each other out, leaving five bonds flat in a pentagon plane (72°).', 
      ta: 'இரண்டு செங்குத்து தனித்த ஜோடிகள் ஒன்றை ஒன்று சமன் செய்து, ஐந்து பிணைப்புகளை ஐங்கோண தளத்தில் தட்டையாக விட்டுவிடுகின்றன (72°).' 
    }
  }
};

// Real Molecules Database
const REAL_MOLECULES = {
  'co2': {
    name: { en: 'Carbon Dioxide', ta: 'கார்பன் டை ஆக்சைடு' },
    formula: 'CO₂',
    centralAtom: 'C',
    outerAtom: 'O',
    bonds: [
      { type: 'double' },
      { type: 'double' }
    ],
    lonePairs: 0,
    realAngle: '180°',
    description: {
      en: 'Carbon Dioxide consists of carbon double-bonded to two oxygen atoms. The two double bonds count as two electron domains, resulting in a perfectly linear shape with no lone pairs on the central carbon.',
      ta: 'கார்பன் டை ஆக்சைடு இரண்டு ஆக்சிஜன் அணுக்களுடன் இரட்டைப் பிணைப்புடன் இணைக்கப்பட்ட கார்பனைக் கொண்டுள்ளது. இந்த இரண்டு இரட்டைப் பிணைப்புகளும் இரண்டு எலக்ட்ரான் டொமைன்களாகக் கருதப்பட்டு, மையக் கார்பனில் தனித்த ஜோடிகள் இல்லாத நேரியல் வடிவத்தை உருவாக்குகின்றன.'
    }
  },
  'h2o': {
    name: { en: 'Water', ta: 'நீர்' },
    formula: 'H₂O',
    centralAtom: 'O',
    outerAtom: 'H',
    bonds: [
      { type: 'single' },
      { type: 'single' }
    ],
    lonePairs: 2,
    realAngle: '104.5°',
    description: {
      en: 'Water has a central oxygen atom bonded to two hydrogen atoms. The oxygen has two lone pairs. These two lone pairs repel the bonding pairs strongly, compressing the H-O-H angle from 109.5° to 104.5°.',
      ta: 'நீர் இரண்டு ஹைட்ரஜன் அணுக்களுடன் பிணைக்கப்பட்ட ஒரு மைய ஆக்சிஜன் அணுவைக் கொண்டுள்ளது. ஆக்சிஜனில் இரண்டு தனித்த ஜோடிகள் உள்ளன. இந்த இரண்டு தனித்த ஜோடிகளும் பிணைப்பு ஜோடிகளை வலுவாக விலக்கி, H-O-H கோணத்தை 109.5°-லிருந்து 104.5° ஆகச் சுருக்குகின்றன.'
    }
  },
  'nh3': {
    name: { en: 'Ammonia', ta: 'அம்மோனியா' },
    formula: 'NH₃',
    centralAtom: 'N',
    outerAtom: 'H',
    bonds: [
      { type: 'single' },
      { type: 'single' },
      { type: 'single' }
    ],
    lonePairs: 1,
    realAngle: '107.0°',
    description: {
      en: 'Ammonia has a central nitrogen atom single-bonded to three hydrogens. The nitrogen has one lone pair at the apex, which compresses the three N-H bond angles to 107.0°.',
      ta: 'அம்மோனியா மூன்று ஹைட்ரஜன்களுடன் ஒற்றைப் பிணைப்பால் இணைக்கப்பட்ட ஒரு மைய நைட்ரஜன் அணுவைக் கொண்டுள்ளது. நைட்ரஜனின் உச்சியில் ஒரு தனித்த ஜோடி உள்ளது, இது மூன்று N-H பிணைப்புக் கோணங்களை 107.0° ஆகச் சுருக்குகிறது.'
    }
  },
  'ch4': {
    name: { en: 'Methane', ta: 'மீத்தேன்' },
    formula: 'CH₄',
    centralAtom: 'C',
    outerAtom: 'H',
    bonds: [
      { type: 'single' },
      { type: 'single' },
      { type: 'single' },
      { type: 'single' }
    ],
    lonePairs: 0,
    realAngle: '109.5°',
    description: {
      en: 'Methane is the classic tetrahedral molecule. The carbon is bonded to four hydrogens with no lone pairs. All repulsions are completely symmetric, resulting in ideal 109.5° angles.',
      ta: 'மீத்தேன் ஒரு உன்னதமான நான்முகி மூலக்கூறு ஆகும். கார்பன் நான்கு ஹைட்ரஜன்களுடன் தனித்த ஜோடிகள் ஏதுமின்றி பிணைக்கப்பட்டுள்ளது. அனைத்து விலக்கங்களும் முற்றிலும் சமச்சீரானவை, இதனால் சிறந்த 109.5° கோணங்கள் உருவாகின்றன.'
    }
  },
  'pcl5': {
    name: { en: 'Phosphorus Pentachloride', ta: 'பாஸ்பரஸ் பெண்டாகுளோரைடு' },
    formula: 'PCl₅',
    centralAtom: 'P',
    outerAtom: 'Cl',
    bonds: [
      { type: 'single' },
      { type: 'single' },
      { type: 'single' },
      { type: 'single' },
      { type: 'single' }
    ],
    lonePairs: 0,
    realAngle: '90° & 120°',
    description: {
      en: 'Phosphorus Pentachloride has five single bonds and no lone pairs. It forms a trigonal bipyramidal shape. The three chlorine atoms in the equatorial plane are 120° apart, and the two axial chlorines are 90° from the plane.',
      ta: 'பாஸ்பரஸ் பெண்டாகுளோரைடு ஐந்து ஒற்றை பிணைப்புகளைக் கொண்டுள்ளது மற்றும் தனித்த ஜோடிகள் இல்லை. இது முக்கோண இருகூம்பு வடிவத்தை உருவாக்குகிறது. மத்திய சமதளத்தில் உள்ள மூன்று குளோரின் அணுக்கள் 120° இடைவெளியிலும், இரண்டு செங்குத்து குளோரின் அணுக்கள் தளத்திலிருந்து 90° கோணத்திலும் அமைந்துள்ளன.'
    }
  },
  'sf6': {
    name: { en: 'Sulfur Hexafluoride', ta: 'சல்பர் ஹெக்சாபுளோரைடு' },
    formula: 'SF₆',
    centralAtom: 'S',
    outerAtom: 'F',
    bonds: [
      { type: 'single' },
      { type: 'single' },
      { type: 'single' },
      { type: 'single' },
      { type: 'single' },
      { type: 'single' }
    ],
    lonePairs: 0,
    realAngle: '90°',
    description: {
      en: 'Sulfur Hexafluoride consists of six fluorine atoms single-bonded to a central sulfur. With six domains and no lone pairs, it adopts a perfectly symmetrical octahedral geometry with all adjacent bond angles at 90°.',
      ta: 'சல்பர் ஹெக்சாபுளோரைடு ஒரு மைய சல்பருடன் ஒற்றைப் பிணைப்பால் இணைக்கப்பட்ட ஆறு புளோரின் அணுக்களைக் கொண்டுள்ளது. ஆறு டொமைன்கள் மற்றும் தனித்த ஜோடிகள் இல்லாத நிலையில், இது 90° பக்கத்து கோணங்களுடன் முற்றிலும் சமச்சீரான எண்முகி வடிவவியலைப் பெறுகிறது.'
    }
  },
  'bf3': {
    name: { en: 'Boron Trifluoride', ta: 'போரான் முப்புளோரைடு' },
    formula: 'BF₃',
    centralAtom: 'B',
    outerAtom: 'F',
    bonds: [
      { type: 'single' },
      { type: 'single' },
      { type: 'single' }
    ],
    lonePairs: 0,
    realAngle: '120°',
    description: {
      en: 'Boron Trifluoride has 3 single bonds and no lone pairs on the central boron atom. It has a trigonal planar molecular geometry with bond angles of exactly 120°.',
      ta: 'போரான் முப்புளோரைடு 3 ஒற்றை பிணைப்புகளைக் கொண்டுள்ளது மற்றும் மைய போரான் அணுவில் தனித்த ஜோடிகள் இல்லை. இது முக்கோண சமதள மூலக்கூறு வடிவத்தைக் கொண்டுள்ளது மற்றும் இதன் பிணைப்புக் கோணம் சரியாக 120° ஆகும்.'
    }
  }
};

// Challenge Mode target configs
const CHALLENGE_PROMPTS = [
  {
    targetGeometry: { en: 'Trigonal Pyramidal', ta: 'முக்கோண கூம்பு' },
    prompt: { en: 'Target: Build a molecule with a Trigonal Pyramidal geometry!', ta: 'இலக்கு: முக்கோண கூம்பு வடிவியல் கொண்ட ஒரு மூலக்கூறை உருவாக்குங்கள்!' },
    hint: { en: 'Hint: A trigonal pyramidal molecule has 4 total electron domains, but only 3 of them are bonded atoms. What does that mean for lone pairs?', ta: 'குறிப்பு: ஒரு முக்கோண கூம்பு மூலக்கூறு 4 எலக்ட்ரான் டொமைன்களைக் கொண்டுள்ளது, ஆனால் அவற்றில் 3 மட்டுமே பிணைக்கப்பட்ட அணுக்கள். அப்படியென்றால் தனித்த ஜோடிகளின் எண்ணிக்கை என்னவாக இருக்கும்?' },
    key: '3_1',
    successMsg: { en: 'Fantastic! You built Trigonal Pyramidal. By adding 3 bonds and 1 lone pair, the lone pair pushed the bonds down into a pyramid!', ta: 'அற்புதம்! நீங்கள் முக்கோண கூம்பு வடிவத்தை உருவாக்கினீர்கள். 3 பிணைப்புகள் மற்றும் 1 தனித்த ஜோடியைச் சேர்த்ததன் மூலம், தனித்த ஜோடி பிணைப்புகளைக் கீழ்நோக்கித் தள்ளிக் கூம்பு வடிவத்தை உருவாக்கியது!' }
  },
  {
    targetGeometry: { en: 'Bent', ta: 'வளைந்த' },
    prompt: { en: 'Target: Build a Bent molecule with a bond angle of approximately 104.5°!', ta: 'இலக்கு: தோராயமாக 104.5° பிணைப்புக் கோணத்தைக் கொண்ட ஒரு வளைந்த மூலக்கூறை உருவாக்குங்கள்!' },
    hint: { en: 'Hint: Water is bent and has an angle of 104.5°. It has 4 total electron domains. How many lone pairs and bonds does water have?', ta: 'குறிப்பு: நீர் வளைந்த வடிவத்தைக் கொண்டது மற்றும் 104.5° கோணத்தைக் கொண்டுள்ளது. இது 4 எலக்ட்ரான் டொமைன்களைக் கொண்டுள்ளது. நீரில் எத்தனை தனித்த ஜோடிகள் மற்றும் பிணைப்புகள் உள்ளன?' },
    key: '2_2',
    successMsg: { en: 'Perfect! You built the water shape: 2 bonds and 2 lone pairs. The two lone pairs repel very strongly, compressing the angle to 104.5°!', ta: 'அருமை! நீங்கள் நீரின் வடிவத்தை உருவாக்கினீர்கள்: 2 பிணைப்புகள் மற்றும் 2 தனித்த ஜோடிகள். இரண்டு தனித்த ஜோடிகளும் மிக வலுவாக விலக்கி, கோணத்தை 104.5° ஆகச் சுருக்குகின்றன!' }
  },
  {
    targetGeometry: { en: 'Linear', ta: 'நேரியல்' },
    prompt: { en: 'Target: Build a Linear molecule with 5 electron domains!', ta: 'இலக்கு: 5 எலக்ட்ரான் டொமைன்களைக் கொண்ட ஒரு நேரியல் மூலக்கூறை உருவாக்குங்கள்!' },
    hint: { en: 'Hint: Remember, some geometries with lone pairs can become linear. If we have 5 total domains, how many lone pairs do we need to leave just 2 bonds standing straight up and down?', ta: 'குறிப்பு: தனித்த ஜோடிகளைக் கொண்ட சில வடிவங்கள் நேரியல் ஆக மாறக்கூடும் என்பதை நினைவில் கொள்க. மொத்தம் 5 டொமைன்கள் இருந்தால், வெறும் 2 பிணைப்புகள் மட்டும் நேராக நிற்க நமக்கு எத்தனை தனித்த ஜோடிகள் தேவைப்படும்?' },
    key: '2_3',
    successMsg: { en: 'Incredible! You built a Linear shape from 5 domains. By placing 3 lone pairs in the equatorial ring, they cancel out, leaving the 2 axial bonds pointing 180° apart.', ta: 'நம்பமுடியாதது! 5 டொமைன்களிலிருந்து நேரியல் வடிவத்தை உருவாக்கினீர்கள். 3 தனித்த ஜோடிகளை மத்திய வளையத்தில் வைத்ததன் மூலம், அவை ஒன்றை ஒன்று சமன் செய்து, 2 செங்குத்து பிணைப்புகளை 180° எதிர் எதிராக விட்டுவிடுகின்றன.' }
  },
  {
    targetGeometry: { en: 'Seesaw', ta: 'ஊஞ்சல் வடிவம்' },
    prompt: { en: 'Target: Build a Seesaw geometry!', ta: 'இலக்கு: ஒரு சீசா (ஊஞ்சல்) வடிவத்தை உருவாக்குங்கள்!' },
    hint: { en: 'Hint: A seesaw shape arises from 5 electron domains. 4 of these are bonded atoms. How many lone pairs do you need?', ta: 'குறிப்பு: சீசா வடிவம் 5 எலக்ட்ரான் டொமைன்களிலிருந்து எழுகிறது. இவற்றில் 4 பிணைக்கப்பட்ட அணுக்கள். உங்களுக்கு எத்தனை தனித்த ஜோடி தேவை?' },
    key: '4_1',
    successMsg: { en: 'Great job! You made a Seesaw. The lone pair prefers the equatorial position, pushing the other 4 bonds into a rocking chair shape.', ta: 'சிறந்த வேலை! நீங்கள் சீசா வடிவத்தை உருவாக்கினீர்கள். தனித்த ஜோடி மத்திய நிலையை விரும்பி, மற்ற 4 பிணைப்புகளையும் ஊஞ்சல் நாற்காலி வடிவில் தள்ளுகிறது.' }
  },
  {
    targetGeometry: { en: 'Square Planar', ta: 'சதுர சமதளம்' },
    prompt: { en: 'Target: Build a Square Planar geometry!', ta: 'இலக்கு: சதுர சமதள வடிவத்தை உருவாக்குங்கள்!' },
    hint: { en: 'Hint: A square planar molecule has 6 total electron domains, but the atoms form a flat square. How many lone pairs are opposite each other to keep it flat?', ta: 'குறிப்பு: ஒரு சதுர சமதள மூலக்கூறு மொத்தம் 6 எலக்ட்ரான் டொமைன்களைக் கொண்டுள்ளது, ஆனால் அணுக்கள் தட்டையான சதுரத்தை உருவாக்குகின்றன. அதைத் தட்டையாக வைத்திருக்க நேர் நேராக எத்தனை தனித்த ஜோடிகள் அமைய வேண்டும்?' },
    key: '4_2',
    successMsg: { en: 'Sensational! Square Planar has 4 bonds and 2 lone pairs. The lone pairs sit opposite each other (axial), leaving 4 bonds flat in a square plane.', ta: 'அற்புதம்! சதுர சமதளம் 4 பிணைப்புகள் மற்றும் 2 தனித்த ஜோடிகளைக் கொண்டுள்ளது. தனித்த ஜோடிகள் நேருக்கு நேராக (செங்குத்தாக) அமைந்து, 4 பிணைப்புகளை ஒரு சதுர சமதளத்தில் தட்டையாக விட்டுவிடுகின்றன.' }
  },
  {
    targetGeometry: { en: 'Trigonal Planar', ta: 'முக்கோண சமதளம்' },
    prompt: { en: 'Target: Build a Trigonal Planar molecule!', ta: 'இலக்கு: முக்கோண சமதள மூலக்கூறை உருவாக்குங்கள்!' },
    hint: { en: 'Hint: This molecule is flat (planar) with three-way symmetry. How many bonded domains and lone pairs does it have?', ta: 'குறிப்பு: இந்த மூலக்கூறு மும்முனை சமச்சீர்மையுடன் தட்டையாக (சமதளமாக) உள்ளது. இதில் எத்தனை பிணைப்பு டொமைன்கள் மற்றும் தனித்த ஜோடிகள் உள்ளன?' },
    key: '3_0',
    successMsg: { en: 'Superb! Trigonal Planar has 3 bonds and 0 lone pairs, spread out evenly at 120° in a single plane.', ta: 'அருமை! முக்கோண சமதளம் 3 பிணைப்புகள் மற்றும் 0 தனித்த ஜோடிகளைக் கொண்டுள்ளது, இவை ஒரே சமதளத்தில் 120° கோணத்தில் சமமாக பரவியுள்ளன.' }
  },
  {
    targetGeometry: { en: 'Octahedral', ta: 'எண்முகி' },
    prompt: { en: 'Target: Build a molecule with Octahedral geometry!', ta: 'இலக்கு: எண்முகி வடிவியல் கொண்ட மூலக்கூறை உருவாக்குங்கள்!' },
    hint: { en: 'Hint: An octahedron has 8 faces and 6 corners. How many bonded domains do you need to place at all 6 corners with no lone pairs?', ta: 'குறிப்பு: ஒரு எண்முகிக்கு 8 முகங்களும் 6 மூலைகளும் உள்ளன. தனித்த ஜோடிகள் இல்லாமல் 6 மூலைகளிலும் வைக்க உங்களுக்கு எத்தனை பிணைப்பு டொமைன்கள் தேவை?' },
    key: '6_0',
    successMsg: { en: 'Superb! Octahedral has 6 bonds and 0 lone pairs. All adjacent bonds are perpendicular, at exactly 90°.', ta: 'அருமை! எண்முகி 6 பிணைப்புகள் மற்றும் 0 தனித்த ஜோடிகளைக் கொண்டுள்ளது. பக்கத்து பிணைப்புகள் அனைத்தும் சரியாக 90° செங்குத்தாக அமைந்துள்ளன.' }
  }
];

// Flat Dictionary for Static i18n
const I18N_DICT = {
  en: {
    title: 'VSEPR Chemistry Sandbox',
    tabLearn: 'Learn Reference',
    tabSandbox: 'Sandbox Builder',
    tabReal: 'Real Molecules',
    tabChallenge: 'Challenge Mode',
    addRemoveDomains: 'Add / Remove Domains',
    addSingle: '➕ Add Single Bond',
    addDouble: '➕➕ Add Double Bond',
    addTriple: '➕➕➕ Add Triple Bond',
    addLone: '🟡 Add Lone Pair',
    removeBond: '➖ Bond',
    removeLone: '➖ Lone Pair',
    clearAll: 'Reset Central Atom',
    selectMolecule: 'Select a Molecule',
    chooseRealPlaceholder: 'Choose a real molecule...',
    targetPractice: 'Target Practice',
    domainInspector: 'Domain Inspector',
    bondedAtomsLabel: 'Bonded Atoms (B)',
    lonePairsLabel: 'Lone Pairs (E)',
    totalDomainsLabel: 'Total Domains (N)',
    electronGeomLabel: 'Electron Geometry',
    molecularGeomLabel: 'Molecular Geometry',
    displaySettings: 'Display Settings',
    showLonePairs: 'Show Lone Pairs',
    showBondAngles: 'Show Bond Angles',
    autoRotate: 'Auto-Rotate Molecule',
    legendCentral: 'Central Atom',
    legendOuter: 'Outer Atom (Bond)',
    legendLone: 'Lone Pair (Electrons)',
    rotateHelper: 'Drag to rotate | Scroll to zoom',
    toastMaxReached: 'Maximum electron domains reached for central atom!',
    challengeComplete: 'Challenge Complete!',
    nextChallenge: 'Next Challenge ➡️',
    centralAtomPlaceholder: 'Central Atom',
    btnPause: '⏸️ Pause',
    btnPlay: '▶️ Auto-Rotate',
    waterBtn: 'H₂O (Water)',
    co2Btn: 'CO₂ (Carbon Dioxide)',
    nh3Btn: 'NH₃ (Ammonia)',
    ch4Btn: 'CH₄ (Methane)',
    pcl5Btn: 'PCl₅ (Phosphorus Pentachloride)',
    sf6Btn: 'SF₆ (Sulfur Hexafluoride)',
    realMoleculeDescDefault: 'Select a molecule from the grid below to examine its structure.',
    diagnosticComplete: 'Diagnostic complete!\n- Configurations Tested: 14\n- Passed: 14\n- Details logged in Console.',
    
    // Iteration 2.0 Additions (Section 5)
    quickExamples: 'Quick Examples',
    btnTourPlay: '▶ Play Tour',
    btnTourStop: '⏸ Stop Tour',
    btnShowSolution: 'Show Solution',
    lblAnalysisTitle: 'Result Analysis Scorecard',
    lblScore: 'Your Score: {score} / 5',
    lblStruggledWith: 'You struggled with:',
    lblPerfectScore: 'Perfect Score! You have fully mastered VSEPR molecular shapes!',
    btnPlayAgain: 'Play Again',
    lblIncorrectBuild: 'Not quite! Check your domain count or lone pair alignment and try again.',
    lblSolutionBuilt: 'Solution loaded! Observe the placement of the outer bonds and lone pair lobes.',
    
    // Learn Reference Table Columns
    tblTotalDomains: 'Total Domains (N)',
    tblBondingPairs: 'Bonding Pairs (B)',
    tblLonePairs: 'Lone Pairs (E)',
    tblElectronGeom: 'Electron Geometry',
    tblMolecularGeom: 'Molecular Geometry',
    tblBondAngle: 'Ideal Bond Angle',
    tblExamples: 'Real Examples',

    // Iteration 3.0 Additions
    stericNumber: 'Steric Number (Total Domains)',
    bondingPairs: 'Bonding Pairs',
    lonePairs: 'Lone Pairs',
    idealAngle: 'Ideal Angle',
    realExamples: 'Real-World Examples',
    closeModal: 'Close ✕',
    scoreCircle: 'Final Score',
    percentage: 'Percentage',
    timeTaken: 'Time Taken',
    perfBreakdown: 'Performance Breakdown',
    statusSuccess: 'Success',
    statusSolution: 'Solution Shown',
    attemptsCount: '{attempts} attempts',
    attemptSingle: '1 attempt',
    statsCorrect: 'Correct Challenges',
    statsWrong: 'Incorrect / Assisted',
    statsTime: 'Total Time Taken',
    btnGoSandbox: 'Change Mode'
  },
  ta: {
    title: 'VSEPR வேதியியல் சாண்ட்பாக்ஸ்',
    tabLearn: 'பயிலும் பகுதி',
    tabSandbox: 'சாண்ட்பாக்ஸ் பில்டர்',
    tabReal: 'நிஜ மூலக்கூறுகள்',
    tabChallenge: 'சவால் முறை',
    addRemoveDomains: 'டொமைன்களை சேர்க்க / நீக்க',
    addSingle: '➕ ஒற்றை பிணைப்பு சேர்',
    addDouble: '➕➕ இரட்டை பிணைப்பு சேர்',
    addTriple: '➕➕➕ மும்மை பிணைப்பு சேர்',
    addLone: '🟡 தனித்த ஜோடி சேர்',
    removeBond: '➖ பிணைப்பு',
    removeLone: '➖ ஜோடி',
    clearAll: 'மைய அணுவை மீட்டமை',
    selectMolecule: 'ஒரு மூலக்கூறைத் தேர்ந்தெடுக்கவும்',
    chooseRealPlaceholder: 'ஒரு நிஜ மூலக்கூறைத் தேர்ந்தெடுக்கவும்...',
    targetPractice: 'இலக்கு பயிற்சி',
    domainInspector: 'டொமைன் ஆய்வாளர்',
    bondedAtomsLabel: 'பிணைக்கப்பட்ட அணுக்கள் (B)',
    lonePairsLabel: 'தனித்த ஜோடிகள் (E)',
    totalDomainsLabel: 'மொத்த டொமைன்கள் (N)',
    electronGeomLabel: 'எலக்ட்ரான் வடிவியல்',
    molecularGeomLabel: 'மூலக்கூறு வடிவியல்',
    displaySettings: 'காட்சி அமைப்புகள்',
    showLonePairs: 'தனித்த ஜோடிகளைக் காட்டு',
    showBondAngles: 'பிணைப்புக் கோணங்களைக் காட்டு',
    autoRotate: 'தானாக சுழற்று',
    legendCentral: 'மைய அணு',
    legendOuter: 'வெளி அணு (பிணைப்பு)',
    legendLone: 'தனித்த ஜோடி (எலக்ட்ரான்கள்)',
    rotateHelper: 'சுழற்ற இழுக்கவும் | பெரிதாக்க உருட்டவும்',
    toastMaxReached: 'மைய அணுவின் அதிகபட்ச எலக்ட்ரான் டொமைன்கள் எட்டப்பட்டுவிட்டன!',
    challengeComplete: 'சவால் முடிந்தது!',
    nextChallenge: 'அடுத்த சவால்',
    centralAtomPlaceholder: 'மைய அணு',
    btnPause: 'இடைநிறுத்து',
    btnPlay: 'தானாக சுழற்று',
    waterBtn: 'H₂O (நீர்)',
    co2Btn: 'CO₂ (கார்பன் டை ஆக்சைடு)',
    nh3Btn: 'NH₃ (அம்மோனியா)',
    ch4Btn: 'CH₄ (மீத்தேன்)',
    pcl5Btn: 'PCl₅ (பாஸ்பரஸ் பெண்டாகுளோரைடு)',
    sf6Btn: 'SF₆ (சல்பர் ஹெக்சாபுளோரைடு)',
    realMoleculeDescDefault: 'அதன் கட்டமைப்பை ஆராய கீழே உள்ள கட்டத்திலிருந்து ஒரு மூலக்கூறைத் தேர்ந்தெடுக்கவும்.',
    diagnosticComplete: 'கண்டறிதல் முடிந்தது!\n- சோதிக்கப்பட்ட அமைப்புகள்: 14\n- தேர்ச்சி பெற்றது: 14\n- விவரங்கள் கன்சோலில் பதிவு செய்யப்பட்டுள்ளன.',
    
    // Iteration 2.0 Additions (Section 5)
    quickExamples: 'விரைவான எடுத்துக்காட்டுகள்',
    btnTourPlay: '▶ டூர் தொடங்கு',
    btnTourStop: '⏸ டூரை நிறுத்து',
    btnShowSolution: 'தீர்வைக் காட்டு',
    lblAnalysisTitle: 'முடிவு பகுப்பாய்வு அட்டை',
    lblScore: 'உங்கள் மதிப்பெண்: {score} / 5',
    lblStruggledWith: 'நீங்கள் சிரமப்பட்ட வடிவங்கள்:',
    lblPerfectScore: 'முழுமையான மதிப்பெண்! நீங்கள் அனைத்து VSEPR வடிவங்களையும் முழுமையாக தேர்ச்சி பெற்றுள்ளீர்கள்!',
    btnPlayAgain: 'மீண்டும் விளையாடு',
    lblIncorrectBuild: 'சரியான வடிவம் அல்ல! உங்கள் டொமைன் எண்ணிக்கை அல்லது தனித்த ஜோடி அமைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    lblSolutionBuilt: 'தீர்வு காட்டப்பட்டுள்ளது! வெளி பிணைப்புகள் மற்றும் தனித்த ஜோடி அமைப்புகளை ஆராயுங்கள்.',
    
    // Learn Reference Table Columns
    tblTotalDomains: 'மொத்த டொமைன்கள் (N)',
    tblBondingPairs: 'பிணைப்பு ஜோடிகள் (B)',
    tblLonePairs: 'தனித்த ஜோடிகள் (E)',
    tblElectronGeom: 'எலக்ட்ரான் வடிவியல்',
    tblMolecularGeom: 'மூலக்கூறு வடிவியல்',
    tblBondAngle: 'சிறந்த பிணைப்புக் கோணம்',
    tblExamples: 'நிஜ எடுத்துக்காட்டுகள்',

    // Iteration 3.0 Additions
    stericNumber: 'ஸ்டெரிக் எண் ( steric number )',
    bondingPairs: 'பிணைப்பு ஜோடிகள்',
    lonePairs: 'தனித்த ஜோடிகள்',
    idealAngle: 'சிறந்த கோணம்',
    realExamples: 'நிஜ உலக எடுத்துக்காட்டுகள்',
    closeModal: 'மூடுக ✕',
    scoreCircle: 'இறுதி மதிப்பெண்',
    percentage: 'சதவீதம்',
    timeTaken: 'எடுத்த நேரம்',
    perfBreakdown: 'செயல்திறன் விவரம்',
    statusSuccess: 'வெற்றி',
    statusSolution: 'தீர்வு காட்டப்பட்டது',
    attemptsCount: '{attempts} முயற்சிகள்',
    attemptSingle: '1 முயற்சி',
    statsCorrect: 'சரியான சவால்கள்',
    statsWrong: 'தவறானவை / உதவப்பட்டவை',
    statsTime: 'மொத்த நேரம்',
    btnGoSandbox: 'முறையை மாற்று'
  }
};

// Add real-world examples metadata to geometries programmatically (Iteration 3.0)
const EXAMPLES_METADATA = {
  '1_0': [
    { name: { en: 'Hydrogen Fluoride', ta: 'ஹைட்ரஜன் புளோரைடு' }, formula: 'HF' },
    { name: { en: 'Hydrogen Chloride', ta: 'ஹைட்ரஜன் குளோரைடு' }, formula: 'HCl' }
  ],
  '1_1': [
    { name: { en: 'Carbon Monoxide', ta: 'கார்பன் மோனாக்சைடு' }, formula: 'CO' }
  ],
  '1_2': [
    { name: { en: 'Nitric Oxide', ta: 'நைட்ரிக் ஆக்சைடு' }, formula: 'NO' }
  ],
  '1_3': [
    { name: { en: 'Chlorine', ta: 'குளோரின்' }, formula: 'Cl₂' }
  ],
  '2_0': [
    { name: { en: 'Carbon Dioxide', ta: 'கார்பன் டை ஆக்சைடு' }, formula: 'CO₂' },
    { name: { en: 'Beryllium Chloride', ta: 'பெரிலியம் குளோரைடு' }, formula: 'BeCl₂' }
  ],
  '3_0': [
    { name: { en: 'Boron Trifluoride', ta: 'போரான் முப்புளோரைடு' }, formula: 'BF₃' },
    { name: { en: 'Aluminum Chloride', ta: 'அலுமினியம் குளோரைடு' }, formula: 'AlCl₃' }
  ],
  '2_1': [
    { name: { en: 'Sulfur Dioxide', ta: 'சல்பர் டை ஆக்சைடு' }, formula: 'SO₂' },
    { name: { en: 'Ozone', ta: 'ஓசோன்' }, formula: 'O₃' }
  ],
  '4_0': [
    { name: { en: 'Methane', ta: 'மீத்தேன்' }, formula: 'CH₄' },
    { name: { en: 'Silicon Tetrachloride', ta: 'சிலிக்கான் டெட்ராகuளோரைடு' }, formula: 'SiCl₄' }
  ],
  '3_1': [
    { name: { en: 'Ammonia', ta: 'அம்மோனியா' }, formula: 'NH₃' },
    { name: { en: 'Phosphine', ta: 'பாஸ்பைன்' }, formula: 'PH₃' }
  ],
  '2_2': [
    { name: { en: 'Water', ta: 'நீர்' }, formula: 'H₂O' },
    { name: { en: 'Oxygen Difluoride', ta: 'ஆக்சிஜன் டைபுளோரைடு' }, formula: 'OF₂' }
  ],
  '5_0': [
    { name: { en: 'Phosphorus Pentachloride', ta: 'பாஸ்பரஸ் பெண்டாகுளோரைடு' }, formula: 'PCl₅' },
    { name: { en: 'Arsenic Pentafluoride', ta: 'ஆர்சனிக் பெண்டாபுளோரைடு' }, formula: 'AsF₅' }
  ],
  '4_1': [
    { name: { en: 'Sulfur Tetrafluoride', ta: 'சல்பர் டெட்ராபுளோரைடு' }, formula: 'SF₄' }
  ],
  '3_2': [
    { name: { en: 'Chlorine Trifluoride', ta: 'குளோரின் முப்புளோரைடு' }, formula: 'ClF₃' },
    { name: { en: 'Bromine Trifluoride', ta: 'புரோமின் முப்புளோரைடு' }, formula: 'BrF₃' }
  ],
  '2_3': [
    { name: { en: 'Xenon Difluoride', ta: 'செனான் டைபுளோரைடு' }, formula: 'XeF₂' }
  ],
  '6_0': [
    { name: { en: 'Sulfur Hexafluoride', ta: 'சல்பர் ஹெக்சாபுளோரைடு' }, formula: 'SF₆' },
    { name: { en: 'Selenium Hexafluoride', ta: 'செலினியம் ஹெக்சாபுளோரைடு' }, formula: 'SeF₆' }
  ],
  '5_1': [
    { name: { en: 'Bromine Pentafluoride', ta: 'புரோமின் பெண்டாபுளோரைடு' }, formula: 'BrF₅' },
    { name: { en: 'Iodine Pentafluoride', ta: 'அயோடின் பெண்டாபுளோரைடு' }, formula: 'IF₅' }
  ],
  '4_2': [
    { name: { en: 'Xenon Tetrafluoride', ta: 'செனான் டெட்ராபுளோரைடு' }, formula: 'XeF₄' }
  ],
  '7_0': [
    { name: { en: 'Iodine Heptafluoride', ta: 'அயோடின் ஹெப்டாபுளோரைடு' }, formula: 'IF₇' }
  ],
  '6_1': [
    { name: { en: 'Xenon Oxypentafluoride Anion', ta: 'செனான் ஆக்சிபெண்டாபுளோரைடு எதிர்மின்அயனி' }, formula: 'XeOF₅⁻' }
  ],
  '5_2': [
    { name: { en: 'Xenon Pentafluoride Anion', ta: 'செனான் பெண்டாபுளோரைடு எதிர்மின்அயனி' }, formula: 'XeF₅⁻' }
  ]
};

for (let key in EXAMPLES_METADATA) {
  if (VSEPR_GEOMETRIES[key]) {
    VSEPR_GEOMETRIES[key].realExamples = EXAMPLES_METADATA[key];
  }
}

// Export to window object for access in other files
window.CPK_COLORS = CPK_COLORS;
window.VSEPR_GEOMETRIES = VSEPR_GEOMETRIES;
window.REAL_MOLECULES = REAL_MOLECULES;
window.CHALLENGE_PROMPTS = CHALLENGE_PROMPTS;
window.I18N_DICT = I18N_DICT;
