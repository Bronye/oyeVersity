import confetti from 'canvas-confetti';

export function fireConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#F97316', '#F59E0B', '#0EA5E9']
    });
  } catch (e) {
    // Non-critical fallback
  }
}
