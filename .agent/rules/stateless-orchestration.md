---
trigger: always_on
---

The Firebase AI Logic layer shall not persist session states in local memory. It must use the Auth Token to retrieve conversation context from the vector store on every request to guarantee scalability for 100+ concurrent users