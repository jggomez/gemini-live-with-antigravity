---
trigger: always_on
---

Components within the UI Layer are prohibited from executing direct fetch calls or using the Firebase SDK. All external communication must be routed through the Integration Layer