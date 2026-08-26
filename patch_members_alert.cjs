const fs = require('fs');

const file = 'src/pages/admin/MembersPanel.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
  'import { Search',
  "import { AdminModal, AdminModalType } from '../../components/admin/AdminModal';\nimport { Search"
);

txt = txt.replace(
  "const [search, setSearch] = useState('');",
  "const [search, setSearch] = useState('');\n  const [modal, setModal] = useState<{isOpen: boolean, type: AdminModalType, title: string, message: string, onConfirm?: () => void}>({isOpen: false, type: 'alert', title: '', message: ''});\n  const closeModal = () => setModal(prev => ({...prev, isOpen: false}));"
);

txt = txt.replace(
  /alert\('Error adding member\. Check console\.'\);/g,
  "setModal({isOpen: true, type: 'error', title: 'Error', message: 'Error adding member. Check console.'});"
);

txt = txt.replace(
  /if\s*\(confirm\(\`¿Estás seguro de que quieres expulsar a \$\{member\.nickname\}\? Pasará a Ex-Miembro\.\`\)\)\s*\{\s*updateMember\(member\.id,\s*'status',\s*'kicked'\);\s*\}/g,
  "setModal({ isOpen: true, type: 'confirm', title: 'Expulsar Miembro', message: `¿Estás seguro de que quieres expulsar a ${member.nickname}? Pasará a Ex-Miembro.`, onConfirm: () => updateMember(member.id, 'status', 'kicked') });"
);

txt = txt.replace(
  'return (',
  'return (\n    <>\n      <AdminModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm || closeModal} onClose={closeModal} />'
);

// We need to also close the Fragment wrapper at the end of the return
txt = txt.replace(/<\/[A-Za-z0-9_]+>\s*;\s*\}\s*$/g, (match) => {
  return match.replace(';', '</>;');
});
// Let's just do a simple replacement for the last `</div>`
txt = txt.substring(0, txt.lastIndexOf('</div>') + 6) + '\n    </>\n  );\n}';

fs.writeFileSync(file, txt);
