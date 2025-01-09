import { __ } from '@wordpress/i18n'
import { useBlockProps, InspectorControls } from '@wordpress/block-editor'

import { useSelect } from '@wordpress/data'
import { PanelBody, SelectControl } from '@wordpress/components'
import { useState, useEffect } from 'react'
import { __experimentalNumberControl as NumberControl } from '@wordpress/components'

export default function Edit({ attributes, setAttributes }) {
    const [postTypes, setPostTypes] = useState([])
    const { postType, postCount } = attributes

    // get all postTypes on load
    const availablePostTypes = useSelect((select) => {
        return select('core').getPostTypes({
            per_page: -1,
        })
    }, [])

    useEffect(() => {
        if (availablePostTypes) {
            // of core post types we only want to show posts, otherwise custom post types
            const filteredPostTypes = availablePostTypes.filter(
                (selectedPostType) =>
                    selectedPostType.viewable &&
                    selectedPostType.slug !== 'page' &&
                    selectedPostType.slug !== 'attachment'
            )

            // format the post types to work with the selectControl
            const formattedPostTypes = filteredPostTypes.map(
                (selectedPostType) => ({
                    value: selectedPostType.slug,
                    label: selectedPostType.name,
                })
            )

            setPostTypes(formattedPostTypes)
        }
    }, [availablePostTypes])

    const posts = useSelect(
        (select) => {
            const posts = select('core').getEntityRecords(
                'postType',
                postType,
                {
                    per_page: postCount,
                }
            )
            return posts
        },
        [postType, postCount]
    )

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Post Type', 'dev')}>
                    <SelectControl
                        label={__('Select Post Type', 'dev')}
                        value={postType}
                        options={[
                            { value: '', label: __('Select Post Type', 'dev') },
                            ...postTypes,
                        ]}
                        onChange={(postType) => setAttributes({ postType })}
                    />
                    <NumberControl
                        label={__('Number of Posts', 'dev')}
                        value={postCount}
                        onChange={(count) =>
                            setAttributes({ postCount: count })
                        }
                    ></NumberControl>
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps()}>
                {!postType && __('Select a Post Type.', 'dev')}

                {!posts && __('Loading', 'dev')}

                {posts && posts.length === 0 && __('No posts', 'dev')}

                {posts && posts.length > 0 && (
                    <ul>
                        {posts.map((post) => (
                            <li>{post.title.raw}</li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
}
