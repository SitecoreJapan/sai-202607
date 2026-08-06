import {
  Field,
  ImageField,
  LinkField,
  DefaultEmptyFieldEditingComponentImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import React from 'react';
import { ComponentProps } from 'lib/component-props';
import Image from 'next/image';

interface ImageFields {
  Image: ImageField;
  ImageCaption: Field<string>;
  TargetUrl: LinkField;
}

interface ImageProps extends ComponentProps {
  fields: ImageFields;
}

export const Default: React.FC<ImageProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();

  const src = fields?.Image?.value?.src;
  const width = fields?.Image?.value?.width;
  const height = fields?.Image?.value?.height;

  console.log('Image fields:', fields?.Image);

  if (page.mode.isEditing && !src) {
    return <DefaultEmptyFieldEditingComponentImage />;
  }

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt="myimage"
      width={Number(width)}
      height={Number(height)}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1440px) 1280px, 1920px"
    />
  );
};
