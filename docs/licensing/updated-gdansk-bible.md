# Updated Gdansk Bible licensing review

Review date: 2026-08-21

## Selected edition

- Name: Uwspółcześniona Biblia Gdańska
- Abbreviation: UBG
- Source identifier: `polubg`
- Language: Polish
- Canon: 66-book Protestant canon
- Source format: eBible.org VPL XML
- Source files date: 2025-12-12
- Source archive:
  `https://ebible.org/Scriptures/polubg_vpl.zip`
- Source XML SHA-256:
  `15260b7b551446def9e253cd1ce1ef145bbfcdb9d172f4cf6f9f671d21f2c2cf`

The selected source contains 66 books, 1189 chapters and 31102 verses.

## Licensing findings

- **Copyright:** © 2018 Fundacja Wrota Nadziei.
- **License:** Creative Commons Attribution-NoDerivatives 4.0 International.
- **Offline redistribution:** permitted.
- **Commercial redistribution:** permitted under the selected CC BY-ND 4.0
  distribution.
- **Attribution:** required. The copyright holder, source and license must be
  identified.
- **Modification:** the actual words and punctuation of Scripture must not be
  changed.
- **Format conversion:** permitted when it does not modify the text.
- **Images and additional materials:** not covered for independent reuse. Verski
  imports only Bible text.

## Rules for Verski

1. Import the official eBible.org VPL XML rather than the Logos Media EPUB.
2. Preserve every word and punctuation mark from the selected source.
3. Limit conversion to structural changes required by the Verski package format.
4. Do not perform editorial corrections, spelling normalization or punctuation
   replacement.
5. Display the translation name, copyright holder, source and license in the
   application.
6. Keep the source checksum in the generated translation manifest.
7. If the source text changes, review the new source and checksum before replacing
   the bundled package.

## Source distinction

The local `epubUBG_2025.epub` identifies its Logos Media ebook edition as
“All Rights Reserved”. It is not the selected redistribution source for Verski.

Verski uses the Bible-text-only VPL distribution published by eBible.org under
CC BY-ND 4.0.

## Official sources

- [UBG edition and downloads](https://ebible.org/bible/details.php?all=1&id=polubg)
- [UBG copyright information](https://ebible.org/polubg/copyright.htm)
- [CC BY-ND 4.0 license](https://creativecommons.org/licenses/by-nd/4.0/)

## Decision

The selected eBible.org UBG distribution is suitable for bundled offline use in
Verski, provided that the text remains unchanged and the required attribution is
included.
