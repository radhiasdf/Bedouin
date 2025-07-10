function handleInteraction(source, target) {
    const s = source.tags;
    const t = target.tags;
  
    if (s.includes("fire") && t.includes("flammable")) {
      ignite(target);
    }
  
    if (s.includes("poisonous") && t.includes("organic")) {
      applyPoison(target);
    }
  
    if (s.includes("wet") && t.includes("burning")) {
      extinguish(target);
    }
  
    if (s.includes("spiky") && t.includes("touch")) {
      damage(source, 1);
    }
  }