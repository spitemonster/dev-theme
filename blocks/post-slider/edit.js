import { __ } from '@wordpress/i18n'
import { useBlockProps, InspectorControls } from '@wordpress/block-editor'
import { useSelect } from '@wordpress/data'
import {
    SelectControl,
    PanelBody,
    FormTokenField,
    __experimentalNumberControl as NumberControl,
    ToggleControl,
} from '@wordpress/components'
import apiFetch from '@wordpress/api-fetch'
import { useState, useEffect, useCallback } from 'react'

export default function Edit({ attributes, setAttributes }) {
    const {
        selectedPostType,
        selectedPosts,
        postsVisible,
        postsToSlide,
        autoplay,
        loop,
    } = attributes

    const [postTypes, setPostTypes] = useState([])
    const [fallbackImage, setFallbackImage] = useState([])

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

    // grab fallback image from custom api endpoint
    useEffect(() => {
        apiFetch({ path: '/site-settings/v1/fallback-image' })
            .then((data) => setFallbackImage(data))
            .catch(console.error)
    }, [])

    const posts = useSelect(
        (select) =>
            select('core').getEntityRecords('postType', selectedPostType, {
                per_page: -1,
                _embed: true,
            }),
        [selectedPostType]
    )

    // cannot express how fucking annoyed I am that I cannot get this to indent correctly
    const postOptions = posts
        ? posts.map((post) => {
              return {
                  id: post.id,
                  title: post.title.raw,
                  excerpt: post.excerpt.raw,
                  featuredImage: post.featured_media,
              }
          })
        : []

    const handlePostSelection = useCallback(
        (tokens) => {
            const selected = tokens.reduce((acc, token) => {
                const matchingPost = postOptions.find(
                    (post) => post.title === token
                )
                if (matchingPost) {
                    acc.push({
                        id: matchingPost.id,
                        title: matchingPost.title.raw,
                        excerpt: matchingPost.excerpt.raw,
                        featuredImage: matchingPost.featured_media,
                    })
                }
                return acc
            }, [])

            setAttributes({ selectedPosts: selected })
        },
        [postOptions, setAttributes]
    )

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
                    <NumberControl
                        __next40pxDefaultSize
                        label={__('Posts Visible', 'kj')}
                        value={postsVisible}
                        min={1}
                        max={selectedPosts.length}
                        onChange={(value) =>
                            setAttributes({ postsVisible: value })
                        }
                    />
                    <NumberControl
                        __next40pxDefaultSize
                        label={__('Posts to Slide', 'kj')}
                        value={postsToSlide}
                        min={1}
                        max={selectedPosts.length}
                        onChange={(value) =>
                            setAttributes({ postsToSlide: value })
                        }
                    />
                    <ToggleControl
                        label={__('Autoplay', 'kj')}
                        value={autoplay}
                        checked={autoplay}
                        onChange={(value) => setAttributes({ autoplay: value })}
                    />
                    <ToggleControl
                        label={__('Loop', 'kj')}
                        value={loop}
                        checked={loop}
                        onChange={(value) => setAttributes({ loop: value })}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps()}>
                {!selectedPostType && 'Select a post type.'}

                {!selectedPosts && 'Loading'}

                {selectedPosts && selectedPosts.length === 0 && 'No Posts'}

                {selectedPosts && selectedPosts.length > 0 && (
                    <ul>
                        {selectedPosts.map((post, index) => {
                            let imgSrc = fallbackImage

                            if (post.featuredImage) {
                                const res = wp.data
                                    .select('core')
                                    .getMedia(post.featuredImage)

                                if (res) imgSrc = res.link
                            }

                            return (
                                <li key={index}>
                                    <figure className="post-card">
                                        <img src={imgSrc} />
                                        <figcaption>
                                            {post?.excerpt?.raw ||
                                                post?.title ||
                                                __('No title available', 'kj')}
                                        </figcaption>
                                    </figure>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </>
    )
}
