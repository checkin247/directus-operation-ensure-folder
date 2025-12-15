export default {
    id: 'ensure-folders',
    name: 'Ensure Folders',
    icon: 'folder',
    description: 'Idempotently create tenant + project folders',
    options: [
        {
            field: 'tenant',
            name: 'Tenant Name',
            type: 'string',
            meta: { width: 'half', interface: 'input' },
        },
        {
            field: 'project',
            name: 'Project Name',
            type: 'string',
            meta: { width: 'half', interface: 'input' },
        },
    ],
};
