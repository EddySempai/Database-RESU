const fs = require('fs');

const file = 'src/pages/admin/ActivityPanel.tsx';
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
  /alert\('Cambios guardados exitosamente'\);/g,
  "setModal({isOpen: true, type: 'success', title: 'Éxito', message: 'Cambios guardados exitosamente'});"
);

txt = txt.replace(
  /alert\('Error guardando cambios'\);/g,
  "setModal({isOpen: true, type: 'error', title: 'Error', message: 'Error guardando cambios'});"
);

txt = txt.replace(
  'return (',
  'return (\n    <>\n      <AdminModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm || closeModal} onClose={closeModal} />'
);

txt = txt.substring(0, txt.lastIndexOf('</div>') + 6) + '\n    </>\n  );\n}';

fs.writeFileSync(file, txt);
