"""Keep both bands of the shared demo focus indicator visible on its surfaces."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def luminance(value):
    rgb = [int(value[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [channel / 12.92 if channel <= .04045 else ((channel + .055) / 1.055) ** 2.4 for channel in rgb]
    return sum(channel * weight for channel, weight in zip(linear, [.2126, .7152, .0722]))


def contrast(first, second):
    low, high = sorted([luminance(first), luminance(second)])
    return (high + .05) / (low + .05)


class DemoFocusContrast(unittest.TestCase):
    def test_focus_bands_cover_light_and_navy_surfaces(self):
        source = (ROOT / 'assets/css/project-demo-theme.css').read_text()
        tokens = dict(re.findall(r'(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})', source))
        ring, halo = tokens['--demo-focus-ring'], tokens['--demo-focus-halo']
        self.assertGreaterEqual(contrast(ring, tokens['--cream']), 3)
        self.assertGreaterEqual(contrast(ring, '#ffffff'), 3)
        self.assertGreaterEqual(contrast(halo, tokens['--navy']), 3)
        self.assertGreaterEqual(contrast(ring, halo), 3)


if __name__ == '__main__':
    unittest.main()
