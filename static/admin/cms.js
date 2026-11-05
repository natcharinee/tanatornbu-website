/* Customisations for the Decap CMS at /admin: plain Thai wording and a preview that looks like the real album page. */
(function () {
  var CMS = window.CMS;
  var h = window.h;

  // --- Plain-language Thai wording (merged over Decap's built-in Thai) ---
  var overrides = {
    app: { header: { content: 'ผลงาน', media: 'คลังรูปภาพ' } },
    collection: {
      sidebar: { collections: 'จัดการ', searchAll: 'ค้นหา' },
      collectionTop: { newButton: '＋ เพิ่ม%{collectionLabel}ใหม่', sortBy: 'เรียงตาม' },
      entries: { loadingEntries: 'กำลังโหลด...', noEntries: 'ยังไม่มีรายการ' }
    },
    editor: {
      editor: {
        onPublishing: 'เผยแพร่ขึ้นเว็บเลยไหม? เว็บจะอัปเดตภายในประมาณ 1–2 นาที',
        onDeletePublishedEntry: 'ลบรายการนี้ออกจากเว็บถาวรเลยไหม? (รูปในคลังรูปภาพจะยังอยู่)',
        onLeavePage: 'ยังมีการแก้ไขที่ยังไม่ได้เผยแพร่ ออกจากหน้านี้เลยไหม?',
        loadingEntry: 'กำลังโหลด...'
      },
      editorControlPane: { widget: { required: 'กรุณากรอก%{fieldLabel}' } },
      editorInterface: { togglePreview: 'เปิด/ปิดตัวอย่างหน้าเว็บ', toggleScrollSync: 'เลื่อนตัวอย่างตามฟอร์ม' },
      editorToolbar: {
        publish: 'เผยแพร่ขึ้นเว็บ',
        publishing: 'กำลังเผยแพร่...',
        published: 'เผยแพร่แล้ว',
        publishNow: 'เผยแพร่ขึ้นเว็บ',
        publishAndCreateNew: 'เผยแพร่ แล้วเพิ่มรายการใหม่',
        publishAndDuplicate: 'เผยแพร่ แล้วทำสำเนา',
        duplicate: 'ทำสำเนา',
        deleteEntry: 'ลบ',
        deletePublishedEntry: 'ลบ',
        deleting: 'กำลังลบ...',
        backCollection: ' กลับไปรายการ%{collectionLabel}',
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

  function AlbumPreview(props) {
    var data = props.entry.get('data');
    var get = function (k) { return data.get(k); };
    var works = (get('works') && get('works').toJS()) || [];
    var concept = (get('concept') && get('concept').toJS()) || {};
    var c = ['th', 'en', 'zh', 'fr'].map(function (k) { return concept[k]; }).filter(function (x) { return x && x.lead; })[0];
    var title = get('title') || 'ชื่ออัลบั้ม';
    // English category name of the chosen category (the relation widget keeps its data in fieldsMetaData)
    var catKey = get('cat') || '';
    var catMeta = props.fieldsMetaData && props.fieldsMetaData.getIn(['cat', 'categories', catKey]);
    var cat = (catMeta && (catMeta.get('name_en') || catMeta.get('name_th'))) ||
      catKey.replace(/-/g, ' ').replace(/\b\w/g, function (m) { return m.toUpperCase(); });

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

  // Hide the "duplicate" options in the publish menu (Decap has no setting for this)
  var hiddenItems = [overrides.editor.editorToolbar.publishAndDuplicate, overrides.editor.editorToolbar.duplicate];
  new MutationObserver(function () {
    document.querySelectorAll('[role="menuitem"]').forEach(function (el) {
      if (hiddenItems.indexOf(el.textContent.trim()) !== -1) el.style.display = 'none';
    });
  }).observe(document.body, { childList: true, subtree: true });
})();
