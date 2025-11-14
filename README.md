# SMEMO - a Multi-modal Interface Promoting Children's Creation of Personal Conversational Agents

This repository contains the implementation of SMEMO, a multi-modal interactive application designed for children. This project was developed as part of research exploring conversational user interfaces for young users.

## Authors

- **Salvatore Fadda**
- **Giovanni Valcarenghi**
- **Claudia Maria Cutrupi**

## Associated Publication

This work is associated with the following paper presented at CUI '20 (2nd Conference on Conversational User Interfaces):

📄 **Paper:** [https://dl.acm.org/doi/10.1145/3405755.3406162](https://dl.acm.org/doi/10.1145/3405755.3406162)

Published at CUI '20: Proceedings of the 2nd Conference on Conversational User Interfaces  
July 2020, Bilbao, Spain

## Project Overview

SMEMO was developed as an experimental multi-modal interface for children, allowing them to interact with an application using voice and manual commands. The main goal of Smemo is to promote an innovative learning method by putting children at the center of the process.
### Key Features

- **Voice Interaction**: Complete hands-free operation designed for children
- **Dialogflow Integration**: Natural language processing and intent recognition for understanding children's voice commands
- **JavaScript Backend**: Pure JavaScript implementation
- **Firebase Integration**: Real-time database and authentication
- **Interactive UI**: Child-friendly visual feedback and animations
- **Memory/Notes Management**: Voice-based note-taking and recall functionality
- **Conversational Design**: Natural conversation flow tailored for children's communication patterns

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** JavaScript (Node.js ecosystem)
- **NLP/Voice:** Google Dialogflow (Intent Recognition & NLU)
- **Database:** Firebase Realtime Database
- **Authentication:** Firebase Authentication
- **Speech Recognition:** Web Speech API (for audio capture)
- **Speech Synthesis:** Web Speech API (Text-to-Speech)


## Current Status

**This project is no longer maintained and is not in a working state.**

The codebase was developed as a research prototype and proof-of-concept for voice interaction with children. While it demonstrated the feasibility of voice-first interfaces for young users, it is not production-ready and may contain:

- Outdated dependencies (Firebase SDK, Dialogflow API versions)
- Deprecated Dialogflow V1/V2 API endpoints
- Browser compatibility issues
- Incomplete error handling
- Security vulnerabilities in unmaintained packages
- Missing Dialogflow agent configuration files


## Research Context

This project explored:
- Voice-based conversational user interfaces for children
- Natural language understanding adapted for children's speech patterns
- Dialogflow as a platform for child-computer interaction
- Accessibility through voice-first design
- Memory and learning applications using speech
- Firebase as a backend for real-time voice applications

## Citation

If you reference this work in academic research, please cite:

```bibtex
@inproceedings{10.1145/3405755.3406162,
author = {Cutrupi, Claudia Maria and Fadda, Salvatore and Valcarenghi, Giovanni and Cosentino, Giulia and Catania, Fabio and Spitale, Micol and Garzotto, Franca},
title = {Smemo: a Multi-modal Interface Promoting Children's Creation of Personal Conversational Agents},
year = {2020},
isbn = {9781450375443},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
url = {https://doi.org/10.1145/3405755.3406162},
doi = {10.1145/3405755.3406162},
abstract = {Recent improvements in natural language processing pushed the development of a wide range of products and applications that allow natural spoken interaction for children. Previous studies explored conversational agents for children and found out that they are valuable both for playing and learning. In addition, recent researches highlighted that, when we want to develop a conversational tool for children, we must consider that they have different modes from adults and they approach conversational technologies in a different way because of their linguistic skills, their way of conducting dialogues and, more generally, their interaction attitude. In this paper, we describe Smemo, a multi-modal interface for children aged 6 to 9 years old. This tool permits to approach conversational technologies in an original and multi-modal way giving the user the possibility to customize and personalize the agent. The main goal of Smemo is to promote an innovative learning method by putting children at the center of the process.},
booktitle = {Proceedings of the 2nd Conference on Conversational User Interfaces},
articleno = {36},
numpages = {3},
keywords = {Natural Language Visualization, Learning, Language Learning, Conversational Technology, Children},
location = {Bilbao, Spain},
series = {CUI '20}
}
```

## License

MIT License


## Acknowledgments

This work was presented at the 2nd Conference on Conversational User Interfaces (CUI '20) in Bilbao, Spain.

---

**Note:** This is an archived research project. For inquiries about the research or methodology, please refer to the published paper.

