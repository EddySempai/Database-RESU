const fs = require('fs');

const esData = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));
const enData = JSON.parse(fs.readFileSync('src/locales/en/operativos.json', 'utf8'));
const jaData = JSON.parse(fs.readFileSync('src/locales/ja/operativos.json', 'utf8'));

// Dictionaries
const dict = {
  'bsaa-chris': {
    ES: {
      unitType: "Atacante",
      rarity: "Legendario",
      skills: [
        { name: "Golpe Fuerte", description: "Cuando las cosas se ponen difíciles, BSAA Chris Redfield golpea una roca con todas sus fuerzas. La roca sale rodando hacia adelante, infligiendo un daño igual al x% del Ataque a los enemigos dentro del alcance y aturdiéndolos durante 2 segundos. Los enemigos dañados ven reducida su Defensa en un y% durante 10 segundos." },
        { name: "Control de Boca", description: "Después de cada 7 ataques normales, inflige x% más de daño de ataque normal e ignora la defensa contra un solo enemigo." },
        { name: "Compañero Correcto", description: "Aumenta el Ataque en x% durante 10 segundos. Si se despliega junto a Sheva Alomar, el Ataque de Sheva Alomar aumentará en el mismo porcentaje." },
        { name: "Cambio Táctico", description: "Aumenta la Velocidad de Ataque de BSAA Chris Redfield en x%." },
        { name: "Potencia de Fuego Concentrada", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, aumenta la Penetración del escuadrón en x%." },
        { name: "Supresión Abrumadora", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, después de atacar 3 veces, los Atacantes aliados reducen el daño recibido de los enemigos en x% durante 2 turnos." },
        { name: "Golpe Concentrado", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, aumenta el daño infligido por los Atacantes aliados al enemigo en x%." },
        { name: "Táctica Defensiva de la BSAA", description: "Si este héroe es el Líder de Guarnición, aumenta la Defensa del escuadrón aliado en x% en las Batallas de Guarnición." }
      ]
    },
    EN: {
      unitType: "Attacker",
      rarity: "Legendary",
      skills: [
        { name: "Heavy Blow", description: "When things get tough, BSAA Chris Redfield punches a boulder with all his might. The boulder is sent rolling forward, dealing damage equal to x% of Attack to enemies in range and stunning them for 2 seconds. Damaged enemies have their Defense reduced by y% for 10 seconds." },
        { name: "Muzzle Control", description: "After every 7 normal attacks, deals x% increased normal attack damage and ignores defense against a single enemy." },
        { name: "Right Partner", description: "Increases Attack by x% for 10 seconds. If deployed alongside Sheva Alomar, Sheva Alomar's Attack will increase by the same percentage." },
        { name: "Tactical Shift", description: "Increases BSAA Chris Redfield's Attack Speed by x%." },
        { name: "Focused Firepower", description: "When an ally squad containing this hero is in battle, increases the Penetration of the squad by x%." },
        { name: "Overwhelming Suppression", description: "When an ally squad containing this hero is in battle, after attacking 3 times, ally Attackers reduce damage taken from enemies by x% for 2 turns." },
        { name: "Focused Strike", description: "When an ally squad containing this hero is in battle, increases damage dealt by ally Attackers to the enemy by x%." },
        { name: "BSAA Defensive Tactic", description: "If this hero is the Garrison Leader, increases the Defense of the ally squad by x% in Garrison Battles." }
      ]
    },
    JA: {
      unitType: "アタッカー",
      rarity: "レジェンダリー",
      skills: [
        { name: "強烈な一撃", description: "状況が困難になると、BSAAクリス・レッドフィールドは全力で岩を殴ります。岩は前方に転がり、範囲内の敵に攻撃力のx%に相当するダメージを与え、2秒間気絶させます。ダメージを受けた敵の防御力は10秒間y%減少します。" },
        { name: "マズルコントロール", description: "通常攻撃を7回行うごとに、単体の敵に対してx%増加した通常攻撃ダメージを与え、防御を無視します。" },
        { name: "ライトパートナー", description: "10秒間攻撃力をx%増加させます。シェバ・アロマーと一緒に配置された場合、シェバ・アロマーの攻撃力も同じ割合で増加します。" },
        { name: "タクティカルシフト", description: "BSAAクリス・レッドフィールドの攻撃速度をx%増加させます。" },
        { name: "集中火力", description: "このヒーローを含む味方分隊が戦闘中の場合、分隊の貫通力をx%増加させます。" },
        { name: "圧倒的制圧", description: "このヒーローを含む味方分隊が戦闘中の場合、3回攻撃した後、味方のアタッカーは2ターンの間、敵から受けるダメージをx%減少させます。" },
        { name: "集中ストライク", description: "このヒーローを含む味方分隊が戦闘中の場合、味方アタッカーが敵に与えるダメージをx%増加させます。" },
        { name: "BSAA防衛戦術", description: "このヒーローが駐屯地のリーダーである場合、駐屯地戦で味方分隊の防御力をx%増加させます。" }
      ]
    }
  },
  'sheva': {
    ES: {
      unitType: "Ranger",
      rarity: "Legendario",
      skills: [
        { name: "Arco Largo", description: "Usa su arco largo para disparar a un enemigo dentro del alcance, infligiendo daño igual al x% del Ataque y aturdiéndolo durante 3 segundos." },
        { name: "Porra Eléctrica", description: "Empuña una Porra Eléctrica, infligiendo daño igual al x% del Ataque a todos los enemigos dentro del alcance y aturdiéndolos durante 2 segundos." },
        { name: "Compañera Izquierda", description: "Cada 18 segundos, recupera PV igual al x% del Ataque si los PV están por debajo del 50%. Si se despliega junto a BSAA Chris Redfield, BSAA Chris Redfield se curará por la misma cantidad de PV." },
        { name: "Fuego de Cobertura de Shujaa", description: "Al ser golpeada por un ataque, Sheva Alomar obtiene un escudo que bloquea daño igual al x% de sus PV Máximos." },
        { name: "Instintos de Batalla", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, tiene un 25% de probabilidad de reducir el daño infligido por el enemigo al escuadrón en x%." },
        { name: "Fuego de Cobertura", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, aumenta el daño infligido por el escuadrón al enemigo en x%." },
        { name: "Camuflaje", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, los Defensores aliados tienen un x% de probabilidad de esquivar el ataque del enemigo." },
        { name: "Honor de Shujaa", description: "Si este héroe es el Líder de Concentración, aumenta los PV del escuadrón aliado en x% en las Batallas de Concentración." }
      ]
    },
    EN: {
      unitType: "Ranger",
      rarity: "Legendary",
      skills: [
        { name: "Longbow", description: "Uses her longbow to fire at an enemy in range, dealing damage equal to x% of Attack and stunning them for 3 seconds." },
        { name: "Stun Rod", description: "Wields a Stun Rod, dealing damage equal to x% of Attack to all enemies in range and stunning them for 2 seconds." },
        { name: "Left Partner", description: "Every 18 seconds, recovers HP equal to x% of Attack if HP is under 50%. If deployed alongside BSAA Chris Redfield, BSAA Chris Redfield will heal for the same amount of HP." },
        { name: "Shujaa's Cover Fire", description: "When hit by an attack, Sheva Alomar gains a shield that blocks damage equal to x% of her Max HP." },
        { name: "Battlefield Instincts", description: "When an ally squad containing this hero is in battle, has a 25% chance to reduce damage dealt by the enemy to the squad by x%." },
        { name: "Cover Fire", description: "When an ally squad containing this hero is in battle, increases damage dealt by the squad to the enemy by x%." },
        { name: "Camouflage", description: "When an ally squad containing this hero is in battle, ally Defenders have a x% chance to dodge the enemy's attack." },
        { name: "Shujaa's Honor", description: "If this hero is the Rally Leader, increases the HP of the ally squad by x% in Rally Battles." }
      ]
    },
    JA: {
      unitType: "レンジャー",
      rarity: "レジェンダリー",
      skills: [
        { name: "ロングボウ", description: "ロングボウを使って範囲内の敵を射撃し、攻撃力のx%に相当するダメージを与え、3秒間気絶させます。" },
        { name: "スタンロッド", description: "スタンロッドを振り回し、範囲内のすべての敵に攻撃力のx%に相当するダメージを与え、2秒間気絶させます。" },
        { name: "レフトパートナー", description: "HPが50%未満の場合、18秒ごとに攻撃力のx%に相当するHPを回復します。BSAAクリス・レッドフィールドと一緒に配置された場合、クリスも同じ量のHPを回復します。" },
        { name: "シュジャの援護射撃", description: "攻撃を受けた際、シェバ・アロマーは最大HPのx%に相当するダメージを防ぐシールドを獲得します。" },
        { name: "戦場の直感", description: "このヒーローを含む味方分隊が戦闘中の場合、25%の確率で敵から分隊へのダメージをx%減少させます。" },
        { name: "援護射撃", description: "このヒーローを含む味方分隊が戦闘中の場合、分隊が敵に与えるダメージをx%増加させます。" },
        { name: "カモフラージュ", description: "このヒーローを含む味方分隊が戦闘中の場合、味方のディフェンダーはx%の確率で敵の攻撃を回避します。" },
        { name: "シュジャの誇り", description: "このヒーローがラリーリーダーである場合、ラリー戦で味方分隊のHPをx%増加させます。" }
      ]
    }
  },
  'excella': {
    ES: {
      unitType: "Defensor",
      rarity: "Legendario",
      skills: [
        { name: "Prueba de Toxicidad", description: "Dispara a un enemigo dentro del alcance con una bala tóxica, infligiendo daño igual al x% de los PV Máximos del enemigo y envenenándolo durante 10 segundos. Las unidades envenenadas reciben daño igual al y% del Ataque cada segundo." },
        { name: "Aumentar Toxicidad", description: "Reduce el Ataque de los enemigos envenenados en x% y su Defensa en y%." },
        { name: "Investigación de Evolución", description: "Aumenta el daño infligido por los aliados en x% durante 10 segundos." },
        { name: "Difusión Virulenta", description: "Cuando se usa 'Prueba de Toxicidad', la toxina se propaga, envenenando a un x% adicional de enemigos. En el nivel 5, la habilidad además aturde a los objetivos envenenados durante 1 segundo." },
        { name: "Conoce tu Lugar", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, reduce la Defensa del enemigo en x%." },
        { name: "Corte de Sinapsis", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, cada 2 turnos, los Rangers aliados tienen un x% de probabilidad de aturdir a su tipo de enemigo objetivo durante 1 turno. (Se pueden hacer intentos de aturdimiento en un objetivo hasta 3 veces por turno)." },
        { name: "Marcar Espécimen", description: "Cuando un escuadrón aliado que contiene a este héroe está en combate, aumenta el daño recibido por el enemigo en x%." },
        { name: "Directiva Descendente", description: "Si este héroe es el Líder de Concentración, aumenta el Ataque del escuadrón aliado en x% en las Batallas de Concentración." }
      ]
    },
    EN: {
      unitType: "Defender",
      rarity: "Legendary",
      skills: [
        { name: "Toxicity Test", description: "Blasts an enemy in range with a toxic round, dealing damage equal to x% of the enemy's Max HP and poisoning them for 10 seconds. Poisoned units take damage equal to y% of Attack every second." },
        { name: "Boost Toxicity", description: "Reduces the Attack of poisoned enemies by x% and Defense by y%." },
        { name: "Evolution Research", description: "Increases damage dealt by allies by x% for 10 seconds." },
        { name: "Virulent Diffusion", description: "When 'Toxicity Test' is used, the toxin spreads, poisoning x% additional enemies. At Lv. 5, the skill additionally stuns poisoned targets for 1 second." },
        { name: "Know Your Place", description: "When an ally squad containing this hero is in battle, reduces the Defense of the enemy by x%." },
        { name: "Synapse Sever", description: "When an ally squad containing this hero is in battle, every 2 turns, ally Rangers have a x% chance to stun their targeted enemy type for 1 turn. (Stun attempts may be made on a target up to 3 times a turn.)" },
        { name: "Mark Specimen", description: "When an ally squad containing this hero is in battle, increases damage taken by the enemy by x%." },
        { name: "Top-Down Directive", description: "If this hero is the Rally Leader, increases the Attack of the ally squad by x% in Rally Battles." }
      ]
    },
    JA: {
      unitType: "ディフェンダー",
      rarity: "レジェンダリー",
      skills: [
        { name: "毒性テスト", description: "範囲内の敵に毒弾を発射し、敵の最大HPのx%に相当するダメージを与え、10秒間毒状態にします。毒状態のユニットは毎秒攻撃力のy%に相当するダメージを受けます。" },
        { name: "毒性増強", description: "毒状態の敵の攻撃力をx%、防御力をy%減少させます。" },
        { name: "進化研究", description: "10秒間、味方が与えるダメージをx%増加させます。" },
        { name: "悪性拡散", description: "「毒性テスト」を使用すると、毒が広がり、さらにx%の敵を毒状態にします。Lv.5では、追加で毒状態のターゲットを1秒間気絶させます。" },
        { name: "身の程を知れ", description: "このヒーローを含む味方分隊が戦闘中の場合、敵の防御力をx%減少させます。" },
        { name: "シナプス切断", description: "このヒーローを含む味方分隊が戦闘中の場合、2ターンごとに味方レンジャーはx%の確率でターゲットとなる敵タイプを1ターン気絶させます。（1ターンに最大3回まで気絶を試みることができます）" },
        { name: "標本マーキング", description: "このヒーローを含む味方分隊が戦闘中の場合、敵が受けるダメージをx%増加させます。" },
        { name: "トップダウン指令", description: "このヒーローがラリーリーダーである場合、ラリー戦で味方分隊の攻撃力をx%増加させます。" }
      ]
    }
  }
};

const updateFile = (data, lang) => {
  ['bsaa-chris', 'sheva', 'excella'].forEach(id => {
    let opIndex = data.findIndex(o => o.id === id);
    if (opIndex === -1 && lang !== 'ES') {
       // if missing in EN/JA, copy from ES but update translations
       const esOp = esData.find(o => o.id === id);
       data.push(JSON.parse(JSON.stringify(esOp)));
       opIndex = data.length - 1;
    }
    const op = data[opIndex];
    op.unitType = dict[id][lang].unitType;
    op.rarity = dict[id][lang].rarity;
    op.skills.forEach((skill, i) => {
      skill.name = dict[id][lang].skills[i].name;
      skill.description = dict[id][lang].skills[i].description;
    });
  });
};

updateFile(esData, 'ES');
updateFile(enData, 'EN');
updateFile(jaData, 'JA');

fs.writeFileSync('src/data/operativos.json', JSON.stringify(esData, null, 2));
fs.writeFileSync('src/locales/en/operativos.json', JSON.stringify(enData, null, 2));
fs.writeFileSync('src/locales/ja/operativos.json', JSON.stringify(jaData, null, 2));

console.log('Done!');
