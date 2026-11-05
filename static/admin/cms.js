/* Customisations for the Decap CMS at /admin: plain Thai wording and a preview that looks like the real album page. */
(function () {
  var CMS = window.CMS;
  var h = window.h;

  // --- Plain-language Thai wording (merged over Decap's built-in Thai) ---
  var overrides = {
    app: { header: { content: 'อัลบั้มผลงาน', media: 'คลังรูปภาพ' } },
    collection: {
      sidebar: { collections: 'เมนู', searchAll: 'ค้นหาอัลบั้ม' },
      collectionTop: { newButton: '＋ เพิ่ม%{collectionLabel}ใหม่', sortBy: 'เรียงตาม' },
      entries: { loadingEntries: 'กำลังโหลดอัลบั้ม...', noEntries: 'ยังไม่มีอัลบั้ม' }
    },
    editor: {
      editor: {
        onPublishing: 'เผยแพร่อัลบั้มนี้ขึ้นเว็บเลยไหม? เว็บจะอัปเดตภายในประมาณ 1–2 นาที',
        onDeletePublishedEntry: 'ลบอัลบั้มนี้ออกจากเว็บถาวรเลยไหม? (รูปในคลังรูปภาพจะยังอยู่)',
        onLeavePage: 'ยังมีการแก้ไขที่ยังไม่ได้เผยแพร่ ออกจากหน้านี้เลยไหม?',
        loadingEntry: 'กำลังโหลดอัลบั้ม...'
      },
      editorControlPane: { widget: { required: 'กรุณากรอก%{fieldLabel}' } },
      editorInterface: { togglePreview: 'เปิด/ปิดตัวอย่างหน้าเว็บ', toggleScrollSync: 'เลื่อนตัวอย่างตามฟอร์ม' },
      editorToolbar: {
        publish: 'เผยแพร่ขึ้นเว็บ',
        publishing: 'กำลังเผยแพร่...',
        published: 'เผยแพร่แล้ว',
        publishNow: 'เผยแพร่ขึ้นเว็บ',
        publishAndCreateNew: 'เผยแพร่ แล้วเพิ่มอัลบั้มใหม่',
        publishAndDuplicate: 'เผยแพร่ แล้วทำสำเนาอัลบั้มนี้',
        duplicate: 'ทำสำเนาอัลบั้มนี้',
        deleteEntry: 'ลบอัลบั้ม',
        deletePublishedEntry: 'ลบอัลบั้ม',
        deleting: 'กำลังลบ...',
        backCollection: ' กลับไปรายการอัลบั้ม',
        unsavedChanges: 'ยังไม่ได้เผยแพร่',
        changesSaved: 'เผยแพร่แล้ว ตรงกับบนเว็บ',
        deployButtonLabel: 'เปิดหน้าเว็บจริง'
      },
      editorWidgets: {
        image: { choose: 'เลือกรูป', chooseDifferent: 'เปลี่ยนรูป', remove: 'เอารูปออก' },
        list: { add: 'เพิ่ม%{item}', addType: 'เพิ่ม%{item}' }
      }
    },
    mediaLibrary: {
      mediaLibraryModal: {
        uploadNew: 'อัปโหลดรูปใหม่',
        chooseSelected: 'ใช้รูปที่เลือก',
        search: 'ค้นหารูป...',
        mediaAssets: 'คลังรูปภาพ',
        images: 'รูปภาพ'
      }
    }
  };

  function merge(base, extra) {
    var out = Object.assign({}, base);
    Object.keys(extra).forEach(function (k) {
      var b = base && base[k];
      out[k] = b && typeof b === 'object' && typeof extra[k] === 'object' ? merge(b, extra[k]) : extra[k];
    });
    return out;
  }
  CMS.registerLocale('th', merge(CMS.getLocale('th') || {}, overrides));

  // --- Preview pane: render the album like the real /works/<album>/ page ---
  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Lato:wght@300;400;700&family=Dosis:wght@400;500&family=Noto+Serif+Thai:wght@400;500&family=Sarabun:wght@300;400;700&display=swap');
  CMS.registerPreviewStyle('/assets/css/style.css');
  CMS.registerPreviewStyle('body{background:#fff}.gallery .wrap{grid-template-columns:repeat(3,minmax(0,1fr))}.work{cursor:default}.pv-empty{padding:40px 0;text-align:center;color:#888;font-style:italic}', { raw: true });

  var CAT = { painting: 'Painting', sculpture: 'Sculpture', computer: 'Computer Art', drawing: 'Drawing' };

  function AlbumPreview(props) {
    var data = props.entry.get('data');
    var get = function (k) { return data.get(k); };
    var works = (get('works') && get('works').toJS()) || [];
    var concept = (get('concept') && get('concept').toJS()) || {};
    var c = ['th', 'en', 'zh', 'fr'].map(function (k) { return concept[k]; }).filter(function (x) { return x && x.lead; })[0];
    var title = get('title') || 'ชื่ออัลบั้ม';
    var cat = CAT[get('cat')] || '';

    return h('div', {},
      h('div', { className: 'titlebar' }, h('div', { className: 'wrap' }, h('p', { className: 'titlebar__name' }, cat || 'Work of art'))),
      h('section', { className: 'series-top' }, h('div', { className: 'wrap' }, h('div', { className: 'series-title' },
        h('h1', {}, title),
        h('dl', { className: 'meta' },
          h('dt', {}, 'Medium'), h('dd', {}, cat || '—'),
          h('dt', {}, 'Works'), h('dd', {}, String(works.length)),
          get('years') ? h('dt', {}, 'Year') : null, get('years') ? h('dd', {}, get('years')) : null
        )
      ))),
      c ? h('section', { className: 'concept' }, h('div', { className: 'wrap' },
        h('p', { className: 'label' }, 'Concept'),
        h('div', { className: 'concept__body' },
          h('p', { className: 'concept__lead' }, c.lead),
          (c.p || []).filter(Boolean).map(function (p, i) { return h('p', { key: i }, p); }),
          c.quote ? h('blockquote', {}, c.quote) : null
        )
      )) : h('div', { style: { height: '48px' } }),
      h('section', { className: 'gallery' }, works.length
        ? h('div', { className: 'wrap' }, works.map(function (w, i) {
            var src = w.file ? props.getAsset(w.file) : null;
            return h('div', { className: 'work', key: i },
              h('span', { className: 'work__img' }, src ? h('img', { src: src.toString(), alt: '' }) : null),
              h('span', { className: 'work__title' }, w.title || title),
              w.year ? h('span', { className: 'work__meta' }, w.year) : null
            );
          }))
        : h('div', { className: 'wrap' }, h('p', { className: 'pv-empty' }, 'ยังไม่มีรูป — กด "เพิ่มรูป" ในฟอร์มทางซ้าย'))
      )
    );
  }
  CMS.registerPreviewTemplate('albums', AlbumPreview);

  CMS.init();
})();
