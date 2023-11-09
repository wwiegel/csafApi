const ROLIE_feed_json_schema= {
    kind: "SelectionSet",
    selections: [
        {kind: "Field", name: {kind: "Name", value: "feed"},
            selectionSet: {kind: "SelectionSet", selections: [
                {kind: "Field", name: {kind: "Name", value: "id"}},
                {kind: "Field", name: {kind: "Name", value: "title"}},
                {kind: "Field", name: {kind: "Name", value: "link"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "href"}},
                        {kind: "Field", name: {kind: "Name", value: "rel"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "category"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "scheme"}},
                        {kind: "Field", name: {kind: "Name", value: "term"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "updated"}},
                {kind: "Field", name: {kind: "Name", value: "entry"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "id"}},
                        {kind: "Field", name: {kind: "Name", value: "title"}},
                        {kind: "Field", name: {kind: "Name", value: "link"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "href"}},
                                {kind: "Field", name: {kind: "Name", value: "rel"}}
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "published"}},
                        {kind: "Field", name: {kind: "Name", value: "updated"}},
                        {kind: "Field", name: {kind: "Name", value: "summary"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "content"}}
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "content"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "src"}},
                                {kind: "Field", name: {kind: "Name", value: "type"}}
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "format"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "schema"}},
                                {kind: "Field", name: {kind: "Name", value: "version"}}
                            ]}
                        }
                    ]}
                }
            ]}
        }
    ]
};

module.exports = ROLIE_feed_json_schema;