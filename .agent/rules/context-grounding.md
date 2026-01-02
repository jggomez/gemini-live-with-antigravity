---
trigger: model_decision
description: All generated responses must maintain a similarity score higher than 0.8 relative to the extracted PDF content
---

All generated responses must maintain a similarity score higher than 0.8 relative to the extracted PDF content. If no supporting evidence is found, the system must return: 'Information not available in the document