// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCWrapper, NextjsContentSdkComponent, FEaaSWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as RichText from 'src/components/rich-text/RichText';
import * as richtextprops from 'src/components/rich-text/rich-text.props';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as Imagebk from 'src/components/image/Imagebk';
import * as Image from 'src/components/image/Image';
import * as imageprops from 'src/components/image/image.props';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCWrapper],
  ['FEaaSWrapper', FEaaSWrapper],
  ['Form', Form],
  ['RichText', { ...RichText }],
  ['rich-text', { ...richtextprops }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['Imagebk', { ...Imagebk }],
  ['Image', { ...Image }],
  ['image', { ...imageprops }],
]);

export default componentMap;
