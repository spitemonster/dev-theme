import { __ } from '@wordpress/i18n'
import {
    BlockControls,
    useBlockProps,
    RichText,
    MediaUpload,
    MediaUploadCheck,
} from '@wordpress/block-editor'

import { Button, ToolbarGroup, ToolbarButton } from '@wordpress/components'

export default function Edit({ attributes, setAttributes }) {
    const { mediaURL, mediaID, content, url } = attributes

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon="admin-links"
                        label={__('Edit Link', 'dev')}
                        onClick={() => {
                            const newUrl = prompt(
                                __('Enter a URL:', 'dev'),
                                url || ''
                            )
                            if (newUrl !== null) {
                                setAttributes({ url: newUrl })
                            }
                        }}
                    />
                </ToolbarGroup>
            </BlockControls>
            <figure {...useBlockProps()}>
                <MediaUploadCheck>
                    <MediaUpload
                        onSelect={(media) =>
                            setAttributes({
                                mediaURL: media.url,
                                mediaID: media.id,
                            })
                        }
                        value={mediaID}
                        render={({ open }) => (
                            <Button
                                className="media-upload"
                                onClick={open}
                                variant="secondary"
                            >
                                {mediaURL
                                    ? __('Change Image', 'dev')
                                    : __('Open Media Library', 'dev')}
                            </Button>
                        )}
                    />
                </MediaUploadCheck>
                <img
                    src={mediaURL ? mediaURL : 'https://placecats.com/200/200'}
                />
                <figcaption>
                    <RichText
                        tagName="p"
                        value={content}
                        onChange={(value) => setAttributes({ content: value })}
                        placeholder={__(
                            'Enter caption for selected image.',
                            'dev'
                        )}
                    />
                </figcaption>
            </figure>
        </>
    )
}
