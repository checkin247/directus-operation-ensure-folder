export default {
    id: 'ensure-folders',
    handler: async (options, context) => {
        const { services, getSchema, accountability, logger } = context;
        const { ItemsService } = services;

        const tenantName = options?.tenant;
        const projectName = options?.project;

        if (!tenantName) throw new Error('Missing option: tenant');
        if (!projectName) throw new Error('Missing option: project');

        const schema = await getSchema();
        const folders = new ItemsService('directus_folders', { schema, accountability });

        async function ensureFolder(rawName, parent) {
            const name = String(rawName ?? "").trim();
            if (!name) throw new Error("Folder name is empty");

            const filter =
                parent == null
                    ? { name: { _eq: name }, parent: { _null: true } }
                    : { name: { _eq: name }, parent: { _eq: parent } };

            const found = await folders.readByQuery({
                filter,
                limit: 1,
                fields: ["id"],
            });
            logger.info(`found shape: ${Array.isArray(found) ? "array" : typeof found}`);


            // ItemsService may return array OR { data: [...] }
            const foundArr = Array.isArray(found) ? found : found?.data;
            const existingId = foundArr?.[0]?.id;
            if (existingId) return existingId;

            try {
                const created = await folders.createOne({ name, parent: parent ?? null });
                logger.info(`created raw: ${JSON.stringify(created)}`);


                // createOne may return: id string OR object OR { data: { id } }
                const createdId =
                    (typeof created === "string" ? created : null) ??
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
                    fields: ["id"],
                });

                const retryArr = Array.isArray(retry) ? retry : retry?.data;
                const retryId = retryArr?.[0]?.id;
                if (retryId) return retryId;

                throw e;
            }
        }

        const tenantFolderId = await ensureFolder(tenantName, null);
        const projectFolderId = await ensureFolder(projectName, tenantFolderId);

        logger?.info?.(`ensure-folders: tenant=${tenantFolderId}, project=${projectFolderId}`);

        return { tenantFolderId, projectFolderId };
    },
};
