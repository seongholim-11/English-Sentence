// 앱 안 "출처·라이선스"와 NOTICES.md에 싣는 라이선스 원문과 링크.
// CMUdict는 바이너리로 배포할 때 아래 저작권 고지·조건·면책 문구를 함께 제공해야 한다.

export const CMUDICT_URL = 'https://github.com/cmusphinx/cmudict';
export const FREQUENCY_WORDS_URL = 'https://github.com/hermitdave/FrequencyWords';
export const CC_BY_SA_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';
export const OFL_URL = 'https://openfontlicense.org/open-font-license-official-text/';

const CMUDICT_LICENSE_RAW = "Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions\nare met:\n\n1. Redistributions of source code must retain the above copyright\n   notice, this list of conditions and the following disclaimer.\n   The contents of this file are deemed to be source code.\n\n2. Redistributions in binary form must reproduce the above copyright\n   notice, this list of conditions and the following disclaimer in\n   the documentation and/or other materials provided with the\n   distribution.\n\nThis work was supported in part by funding from the Defense Advanced\nResearch Projects Agency, the Office of Naval Research and the National\nScience Foundation of the United States of America, and by member\ncompanies of the Carnegie Mellon Sphinx Speech Consortium. We acknowledge\nthe contributions of many volunteers to the expansion and improvement of\nthis dictionary.\n\nTHIS SOFTWARE IS PROVIDED BY CARNEGIE MELLON UNIVERSITY ``AS IS'' AND\nANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,\nTHE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR\nPURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL CARNEGIE MELLON UNIVERSITY\nNOR ITS EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.";

// 화면에서는 원문의 줄바꿈(문단 안쪽)을 공백으로 이어서 보여 준다. 글자는 원문 그대로다
export const CMUDICT_LICENSE = CMUDICT_LICENSE_RAW.replace(/([^\n])\n[ \t]*(?=[^\n])/g, "$1 ");
