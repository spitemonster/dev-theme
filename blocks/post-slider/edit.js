import { __ } from '@wordpress/i18n'
import { useBlockProps, InspectorControls } from '@wordpress/block-editor'

import { useSelect } from '@wordpress/data'
import { SelectControl, PanelBody, FormTokenField } from '@wordpress/components'
import { useState, useEffect } from 'react'

export default function Edit({ attributes, setAttributes }) {
    const { selectedPostType, selectedPosts } = attributes

    const [postTypes, setPostTypes] = useState([])

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
        (select) =>
            select('core').getEntityRecords('postType', selectedPostType, {
                per_page: -1,
            }),
        [selectedPostType]
    )

    // cannot express how fucking annoyed I am that I cannot get this to indent correctly
    const postOptions = posts
        ? posts.map((post) => ({
              id: post.id,
              title: post.title.rendered,
              excerpt: post.excerpt,
              featuredImage: post.featuredImage,
              permalink: post.permalink,
          }))
        : []

    const handlePostSelection = (tokens) => {
        console.log(tokens)
        const selected = tokens
            .map((token) => {
                const matchingPost = postOptions.find(
                    (post) => post.title === token
                )
                return matchingPost ? matchingPost : null
            })
            .filter(Boolean)

        console.log(selected)
        setAttributes({ selectedPosts: selected })
    }

    return (
        <>
            <InspectorControls>
                <PanelBody title="Posts" initialOpen={false}>
                    <SelectControl
                        label={__('Select Post Type', 'kj')}
                        value={selectedPostType}
                        options={[
                            { value: '', label: 'Select a Post Type' },
                            ...postTypes,
                        ]}
                        onChange={(value) =>
                            setAttributes({
                                selectedPostType: value,
                                selectedPosts: [],
                            })
                        }
                    />
                    <FormTokenField
                        label={__('Select Posts', 'kj')}
                        value={selectedPosts.map(
                            (selectedPost) =>
                                postOptions.find(
                                    (post) => post.id === selectedPost.id
                                )?.title || ''
                        )}
                        suggestions={postOptions.map((post) => post.title)}
                        onChange={handlePostSelection}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps()}>
                {!selectedPostType && 'Select a post type.'}

                {!selectedPosts && 'Loading'}

                {selectedPosts && selectedPosts.length === 0 && 'No Posts'}

                {selectedPosts && selectedPosts.length > 0 && (
                    <ul>
                        {selectedPosts.map((post) => (
                            <li>{post.title}</li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
}
