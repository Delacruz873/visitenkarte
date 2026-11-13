// Gemeinsame Funktionen für App und öffentliche Kontaktseite
var VC = (function () {
  var IDS = ['vorname', 'nachname', 'titel', 'firma', 'tel', 'mobil', 'email', 'web', 'strasse', 'ort', 'notiz'];
  // Reihenfolge im Link (ohne Notiz: die bleibt privat)
  var LINK = ['vorname', 'nachname', 'titel', 'firma', 'tel', 'mobil', 'email', 'web', 'strasse', 'ort'];

  function fullName(d) { return [d.vorname, d.nachname].filter(Boolean).join(' '); }
  function has(d) { return IDS.some(function (k) { return d && d[k]; }); }
  function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }

  function vcard(d, kind) {
    var T = kind === 'privat' ? 'HOME' : 'WORK';
    var L = ['BEGIN:VCARD', 'VERSION:3.0'];
    L.push('N:' + esc(d.nachname || '') + ';' + esc(d.vorname || '') + ';;;');
    L.push('FN:' + esc(fullName(d) || d.firma || 'Kontakt'));
    if (d.firma) L.push('ORG:' + esc(d.firma));
    if (d.titel) L.push('TITLE:' + esc(d.titel));
    if (d.tel) L.push('TEL;TYPE=' + T + ',VOICE:' + d.tel);
    if (d.mobil) L.push('TEL;TYPE=CELL:' + d.mobil);
    if (d.email) L.push('EMAIL;TYPE=INTERNET,' + T + ':' + d.email);
    if (d.web) L.push('URL:' + d.web);
    if (d.strasse || d.ort) {
      var o = d.ort || '', m = o.match(/^(\d{4,5})\s+(.*)$/);
      L.push('ADR;TYPE=' + T + ':;;' + esc(d.strasse || '') + ';' + esc(m ? m[2] : o) + ';;' + esc(m ? m[1] : '') + ';');
    }
    if (d.notiz) L.push('NOTE:' + esc(d.notiz));
    L.push('END:VCARD');
    return L.join('\r\n') + '\r\n';
  }

  function message(d) {
    var L = [fullName(d)];
    var sub = [d.titel, d.firma].filter(Boolean).join(', '); if (sub) L.push(sub);
    if (d.tel) L.push('Tel: ' + d.tel);
    if (d.mobil) L.push('Mobil: ' + d.mobil);
    if (d.email) L.push('E-Mail: ' + d.email);
    if (d.web) L.push('Web: ' + d.web);
    var a = [d.strasse, d.ort].filter(Boolean).join(', '); if (a) L.push('Adresse: ' + a);
    return L.filter(Boolean).join('\n');
  }

  // Daten <-> Link-Anhang (#g~Vorname~Nachname~...). Der Anhang wird nie an einen Server gesendet.
  function encode(d, kind) {
    var parts = LINK.map(function (k) { return encodeURIComponent(d[k] || '').replace(/~/g, '%7E'); });
    while (parts.length && !parts[parts.length - 1]) parts.pop();
    return (kind === 'privat' ? 'p' : 'g') + '~' + parts.join('~');
  }
  function decode(hash) {
    var s = String(hash || '').replace(/^#/, '');
    if (!/^[pg]~/.test(s)) return null;
    var parts = s.split('~'), d = {};
    try { LINK.forEach(function (k, i) { d[k] = decodeURIComponent(parts[i + 1] || ''); }); } catch (e) { return null; }
    return { kind: parts[0] === 'p' ? 'privat' : 'business', data: d };
  }

  function intl(n) {
    var s = String(n).trim(), plus = s.charAt(0) === '+'; s = s.replace(/\D/g, '');
    if (!s) return ''; if (plus) return s; if (s.indexOf('00') === 0) return s.slice(2);
    if (s.charAt(0) === '0') return '49' + s.slice(1); return s;
  }

  function qrSvg(text) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    var q = qrcode(0, 'M'); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }

  function fileName(d) { return (fullName(d) || d.firma || 'Kontakt').replace(/[^\wäöüÄÖÜß -]/g, '').trim() + '.vcf'; }

  return { IDS: IDS, fullName: fullName, has: has, vcard: vcard, message: message, encode: encode, decode: decode, intl: intl, qrSvg: qrSvg, fileName: fileName };
})();
