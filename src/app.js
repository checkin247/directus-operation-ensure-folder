export default {
    id: 'ensure-folders',
    name: 'Ensure Folders',
    icon: 'folder',
    description: 'Idempotently create tenant + project folders',
    options: [
        {
            field: 'folder1',
            name: 'Folder 1',
            type: 'string',
            meta: { width: 'half', interface: 'input', required: true },
        },
        {
            field: 'folder2',
            name: 'Folder 2',
            type: 'string',
            meta: { width: 'half', interface: 'input' },
        },
        {
            field: 'folder3',
            name: 'Folder 3',
            type: 'string',
            meta: { width: 'half', interface: 'input' },
        },
        {
            field: 'folder4',
            name: 'Folder 4',
            type: 'string',
            meta: { width: 'half', interface: 'input' },
        },
        {
            field: 'folder5',
            name: 'Folder 5',
            type: 'string',
            meta: { width: 'half', interface: 'input' },
        }
    ]
};
