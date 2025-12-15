export default {
    id: 'ensure-folders',
    handler: async (options, context) => {
        const { services, getSchema, accountability, logger } = context;
        const { ItemsService } = services;

        const folder1 = options?.folder1;
        if (!folder1) throw new Error('Missing option: folder1');

        const schema = await getSchema();
        const folders = new ItemsService('directus_folders', { schema, accountability });

        async function ensureFolder(rawName, parent) {
            const name = String(rawName ?? '').trim();
            if (!name) throw new Error('Folder name is empty');

            const filter =
                parent == null
                    ? { name: { _eq: name }, parent: { _null: true } }
                    : { name: { _eq: name }, parent: { _eq: parent } };

            const found = await folders.readByQuery({
                filter,
                limit: 1,
                fields: ['id'],
            });

            const foundArr = Array.isArray(found) ? found : found?.data;
            const existingId = foundArr?.[0]?.id;
            if (existingId) return existingId;

            try {
                const created = await folders.createOne({ name, parent: parent ?? null });
                const createdId =
                    (typeof created === 'string' ? created : null) ??
                    created?.id ??
                    created?.data?.id;

                if (!createdId) {
                    throw new Error(`createOne returned unexpected shape: ${JSON.stringify(created)}`);
                }

                return createdId;
            } catch (e) {
                // race fallback: re-read
                const retry = await folders.readByQuery({
                    filter,
                    limit: 1,
                    fields: ['id'],
                });
                const retryArr = Array.isArray(retry) ? retry : retry?.data;
                const retryId = retryArr?.[0]?.id;
                if (retryId) return retryId;
                throw e;
            }
        }

        const result = {
            folder1: null,
            folder2: null,
            folder3: null,
            folder4: null,
            folder5: null,
        };

        let parent = null;
        for (let i = 1; i <= 5; i++) {
            const key = `folder${i}`;
            const rawName = options?.[key];
            const name = String(rawName ?? '').trim();

            if (!name) {
                return result;
            }

            const id = await ensureFolder(name, parent);
            if (!id) throw new Error(`ensure-folders: failed to create or find ${key} (${name})`);

            result[key] = id;
            parent = id;
            logger?.info?.(`ensure-folders: set ${key}=${id}`);
        }

        return result;
    },
};
